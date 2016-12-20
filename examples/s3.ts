import { ObjectStorageFactory, provider } from '@telefonica/object-storage';
import * as fs from 'fs';

process.env.S3_BUCKET = 'your-bucket-here';
process.env.S3_SECRET_ACCESS_KEY = 'your-secret-access-key-here';
process.env.S3_ACCESS_KEY_ID = 'your-access-key-id-here';

let mystream = fs.createReadStream('./cajal.jpg');

let serviceProvider: provider = 's3';
let storage = ObjectStorageFactory.get(serviceProvider);
storage.upload(mystream).then((url: string) => console.log('Resource available', url));
