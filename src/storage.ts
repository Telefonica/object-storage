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

import * as storage from 'azure-storage';
const AWS = require('aws-sdk'); // no @types for aws-sdk

export interface IStorage {
    upload(mystream: NodeJS.ReadableStream, name?: string): Promise<string>;
}

/**
 * Uses a Azure Blob object storage.
 */
export class AzureObjectStorage implements IStorage {
    private blob: storage.BlobService;

    constructor() {
        // see official docs https://docs.microsoft.com/en-us/azure/storage/storage-nodejs-how-to-use-blob-storage
        this.blob = storage.createBlobService(process.env.AZURE_STORAGE_ACCOUNT, process.env.AZURE_STORAGE_ACCESS_KEY);
    }

    /**
     * Upload a file to the object storage.
     * @param {NodeJS.ReadableStream} mystream - The readable string to be uploaded.
     * @param {string} [name] - The resource name.
     * @return {Promise<string} A promise of the resource URL.
     */
    upload(mystream: NodeJS.ReadableStream, name?: string): Promise<string> {
        let container = process.env.AZURE_STORAGE_CONTAINER;
        let blob = name || uuid.v4();

        return new Promise((resolve, reject) => {
            let blobStream = this.blob.createWriteStreamToBlockBlob(container, blob, (err: Error, result: storage.BlobService.BlobResult) => {
                if (err) {
                    logger.error(err, 'Error uploading object', blob);
                    return reject(err);
                }

                logger.info('Object uploaded', blob);

                 // generate a signed url that expires for the user
                let sharedAccessPolicy = {
                    AccessPolicy: {
                        Permissions: storage.BlobUtilities.SharedAccessPermissions.READ,
                        Start: new Date(Date.now() - 2 * 60 * 1000), // add security margin
                        Expiry: storage.date.secondsFromNow(2 * 24 * 60 * 60) // XXX should be configurable
                    }
                };

                let token = this.blob.generateSharedAccessSignature(container, blob, sharedAccessPolicy);
                let url = this.blob.getUrl(container, blob, token);
                return resolve(url);
            })

            mystream.pipe(blobStream);
        });
    }
}

/**
 * Uses a S3 object storage.
 * Tested with Telefonica Cloud Storage but should work with any S3-compatible object storage.
 */
export class S3ObjectStorage implements IStorage {
    private s3: any; // AWS.S3;

    constructor() {
        // see official docs http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-examples.html
        let s3Config: any = {
            params: { Bucket: process.env.S3_BUCKET },
            s3ForcePathStyle: true, // mandatory in S3 services other than the official AWS S3
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
        };

        if (process.env.S3_ENDPOINT) {
            s3Config.endpoint = new AWS.Endpoint(process.env.S3_ENDPOINT);
        }

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
            Key: key,
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
                    Expires: 2 * 24 * 60 * 60 // XXX should be configurable
                };
                let url = this.s3.getSignedUrl('getObject', urlParams);
                return resolve(url);
            });
        });
    }
}
