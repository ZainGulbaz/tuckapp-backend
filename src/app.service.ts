import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { Driver } from './driver/driver.entity';
import { STATUS_FAILED, STATUS_NOTFOUND, STATUS_SUCCESS } from './utils/codes';
import { responseInterface } from './utils/interfaces/response';
import { hashSync, genSaltSync } from 'bcrypt';
import { roleEnums } from './utils/enums';
import { generateRandomOtp, verifyRoleAccess } from './utils/commonfunctions';
import Axios from "axios";

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
  ) {}

  getHello(): string {
    return 'Hello World';
  }

  async getAppVersions(type:string):Promise<responseInterface>{
    let statusCode=STATUS_FAILED,message=[],data=[];
    try{
         if(type!=="customer" && type!=="driver") {
                  message.push("Please provide a valid app type i.e customer or driver");
                  statusCode=STATUS_NOTFOUND;
                  return;
         }
         let versions=await this.driverRepository.query(`SELECT * FROM appversion where appType='${type}' GROUP BY version`);
         message.push("The app versions are fetched successfully");
         data=versions;
         statusCode=STATUS_SUCCESS;

    }
    catch(error)
    {
      message.push("Unable to fetch the app versions");
      message.push(error.message);
      statusCode=STATUS_FAILED;
    }
    finally{
return{
  statusCode,
  message,
  data
}
    }
  }

  async generateOtp(id: number, role: string): Promise<responseInterface> {
    let statusCode = STATUS_SUCCESS,
      message = [],
      data = [];

    try {
      let isAllowed = verifyRoleAccess({
        role,
        allowedRoles: [roleEnums.admin],
      });
      if (isAllowed !== true) {
        statusCode = isAllowed.statusCode;
        message.push(isAllowed.message);
        return;
      }

      let otp = generateRandomOtp(parseInt(process.env.DIGITS_OTP));
      const salt = genSaltSync();
      const encryptedOtp = hashSync(otp + '', salt);
      let res = await this.driverRepository.update(id, { otp: encryptedOtp });
      if (res.affected > 0) {
        let driver = await this.driverRepository.findOne({ where: [{ id }] });
        data = [{ ...driver, otp }];
        message.push('The otp has been successfully generated');
      } else {
        message.push('The otp could not be generated');
        statusCode = STATUS_FAILED;
      }
    } catch (err) {
      message.push('The otp could not be generated');
      message.push(err.message);
      statusCode = STATUS_FAILED;
    } finally {
      return {
        statusCode,
        data,
        message,
      };
    }
  }

  async getGoogleRoutes(origin:string, destination:string){
    try{
      let url=`https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${process.env.GOOGLE_MAP_KEY}`;
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url,
        headers: { 
          'X-Android-Package': 'com.example.truck_driver', 
        }
      };
      
      let response =await Axios.request(config);
      console.log(url);
      return response.data;

    }
    catch(err)
    {
      console.log("HEREEEEE");
      console.log(err);

    }
  }


}
