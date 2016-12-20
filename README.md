# object-storage

This is a tool to upload and keep objects in an object storage provider.
Currently supported providers are Azure Blob Storage and any AWS S3 compliant service.

## Usage examples

```javascript
const storage = require('@telefonica/object-storage');

let provider = 'azure'; // "azure" or "s3"
let storage = storage.ObjectStorageFactory.get(provider);
storage.upload(stream).then(url => console.log('Resource available', url));
```

### Azure Blob Storage

Set the following env variables:
- AZURE_STORAGE_CONTAINER
- AZURE_STORAGE_ACCOUNT
- AZURE_STORAGE_ACCESS_KEY

### S3

Set the following env variables:
- S3_ENDPOINT (optional, points to AWS S3 by default)
- S3_BUCKET
- S3_ACCESS_KEY_ID
- S3_SECRET_ACCESS_KEY

It has been tested with Telefónica Cloud Storage, that is S3 compatible.

## LICENSE

Copyright 2016 [Telefónica I+D](http://www.tid.es)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.