import { Address } from '../api-models/address.model';
import { Gender } from '../api-models/gender.model';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  mobile: string;
  profileImageUrl: string;
  genderId: string;
  gender: Gender;
  address: Address;
}
