import { ObjectStorageFactory, provider } from '@telefonica/object-storage';
import * as fs from 'fs';

process.env.AZURE_STORAGE_CONTAINER = 'your-container-here';
process.env.AZURE_STORAGE_ACCOUNT = 'your-storage-account-here';
process.env.AZURE_STORAGE_ACCESS_KEY = 'your-access-key-here';

let mystream = fs.createReadStream('./cajal.jpg');

let serviceProvider: provider = 'azure';
let storage = ObjectStorageFactory.get(serviceProvider);
storage.upload(mystream).then((url: string) => console.log('Resource available', url));
