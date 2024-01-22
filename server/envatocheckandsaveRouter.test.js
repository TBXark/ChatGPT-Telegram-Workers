import test from 'ava';
import request from 'supertest';
import app from './envatocheckandsaveRouter.js';

test('(POST /) Should return error if "registeredurl" parameter is missing', async (t) => {
  const res = await request(app).post('/');
  t.is(res.status, 400);
  t.deepEqual(res.body, { error: 'Missing required "registeredurl" parameter.' });
});

test('(POST /) Should return error if "rsa_private_key" parameter is missing', async (t) => {
  const res = await request(app).post('/').query({ registeredurl: 'example.com' });
  t.is(res.status, 400);
  t.deepEqual(res.body, { error: 'Missing required "rsa_private_key" parameter.' });
});

test('(POST /) Should return error if "key" parameter is missing', async (t) => {
  const res = await request(app).post('/').query({ registeredurl: 'example.com', rsa_private_key: 'private_key' });
  t.is(res.status, 400);
  t.deepEqual(res.body, { error: 'Missing required "key" parameter.' });
});

test('(POST /) Should return error if "registeredurl" parameter has invalid base64 encoding', async (t) => {
  const res = await request(app).post('/').query({ registeredurl: 'invalid_base64', rsa_private_key: 'private_key', key: 'license_key' });
  t.is(res.status, 400);
  t.deepEqual(res.body, { error: 'Invalid base64 encoding in "registeredurl" parameter.' });
});

test('(POST /) Should return error if envatoLicense already exists in the database', async (t) => {
  // Mock the database to return a row with the same envatoLicense
  const dbGetMock = (query, params, callback) => {
    const row = { envatoLicense: 'existing_license', url: 'existing_url' };
    callback(null, row);
  };
  app.locals.db.get = dbGetMock;

  const res = await request(app).post('/').query({ registeredurl: 'example.com', rsa_private_key: 'private_key', key: 'existing_license' });
  t.is(res.status, 400);
  t.deepEqual(res.body, { error: 'envatoLicense already exists with URL: existing_url' });
});

test('(POST /) Should insert a new envatoLicense into the database and return success message', async (t) => {
  // Mock the database to return null (no existing row with the same envatoLicense)
  const dbGetMock = (query, params, callback) => {
    callback(null, null);
  };
  // Mock the database run method to check the inserted values
  const dbRunMock = (query, params, callback) => {
    t.is(query, 'INSERT INTO envatoLicenseKeys (envatoLicense, url) VALUES (?, ?)');
    t.deepEqual(params, ['new_license', 'example.com']);
    callback(null);
  };
  // Mock the fs.readFileSync method to return a public key
  const fsReadFileSyncMock = () => 'public_key';
  app.locals.db.get = dbGetMock;
  app.locals.db.run = dbRunMock;
  app.locals.fs.readFileSync = fsReadFileSyncMock;

  const res = await request(app).post('/').query({ registeredurl: 'example.com', rsa_private_key: 'private_key', key: 'new_license' });
  t.is(res.status, 200);
  t.deepEqual(res.body, { message: 'License added successfully', publicKey: 'public_key' });
});