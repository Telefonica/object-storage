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

import { AzureObjectStorage, S3ObjectStorage, IStorage } from './storage';

export type Provider = 's3'|'azure';

export class ObjectStorageFactory {
    static get(provider: Provider): IStorage {
        // XXX this if/else smells bad from an architectural point of view
        if (provider === 'azure') {
            return new AzureObjectStorage();
        } else if (provider === 's3') {
            return new S3ObjectStorage();
        } else {
            throw new Error('Unsupported storage provider: ' + provider);
        }
    }
}
