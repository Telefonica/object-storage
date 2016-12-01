/**
* @license
* Copyright 2016 Telefónica I+D
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

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

    /**
     * Upload a file to the object storage.
     * @param {NodeJS.ReadableStream} mystream - The readable string to be uploaded.
     * @param {string} [name] - The resource name.
     * @return {Promise<string} A promise of the resource URL.
     */
    upload(mystream: NodeJS.ReadableStream, name?: string): Promise<string> {
        let key = name || uuid.v4();

        let params = {
            Key: key, // use a unguessable key
            Body: mystream
        };

        return new Promise((resolve, reject) => {
            let request = this.s3.upload(params);
            request.send((err: Error, data: any) => {
                if (err) {
                    logger.error(err, 'Error uploading object', params.Key);
                    return reject(err);
                }
                logger.info('Object uploaded', params.Key);

                // generate a signed url that expires for the user
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
