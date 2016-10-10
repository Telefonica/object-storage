import * as fs from 'fs';
import * as logger from 'logops';
import * as stream from 'stream';
import * as uuid from 'node-uuid';

const AWS = require('aws-sdk'); // no @types for aws-sdk

/**
 * Uses a S3-compatible object storage.
 */
export class ObjectStorage {
    private s3: any; // AWS.S3;

    constructor() {
        // see official docs http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-examples.html

        let endpoint = process.env.S3_ENDPOINT;
        let s3Config = {
            params: { Bucket: process.env.S3_BUCKET },
            endpoint: new AWS.Endpoint(endpoint),
            s3ForcePathStyle: true, // mandatory in S3 services other than the official AWS S3
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
        };
        this.s3 = new AWS.S3(s3Config);
    }

    upload(mystream: stream.Readable): Promise<string> {
        let params = {
            Key: uuid.v4(), // usa a unguessable key
            Body: mystream
        };

        return new Promise((resolve, reject) => {
            let request = this.s3.upload(params);
            request.send((err: Error, data: any) => {
                if (err) {
                    logger.error(err, 'Error uploading object');
                    return reject(err);
                }
                logger.info('Object uploaded', params.Key);

                // signed url for the user
                let urlParams = {
                    Key: params.Key,
                    Expires: 120
                };
                let url = this.s3.getSignedUrl('getObject', urlParams);
                return resolve(url);
            });
        });
    }
}
