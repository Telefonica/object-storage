# object-storage

This is a tool to upload and keep objects in a safe place.

## Usage examples

```javascript
let storage = new ObjectStorage();
storage.upload(stream).then(url => console.log('Resource available', url));
```
