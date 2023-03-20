import { createOfferStub } from "../tests/offer.stub"
export const OfferService= jest.fn().mockReturnValue(
    {
        createOffer:jest.fn().mockResolvedValueOnce(createOfferStub)
    }
) 