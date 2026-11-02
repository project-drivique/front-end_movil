/* global __dirname */
require('./setupTestEnv.js');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

describe('Mobile Wompi Payment Architecture Tests', () => {
  it('retira la llave de integridad (integrityKey) del código fuente móvil', () => {
    const wompiServiceCode = fs.readFileSync(
      path.join(__dirname, '../modules/reservation/services/wompiService.ts'),
      'utf8'
    );
    assert.equal(wompiServiceCode.includes('test_integrity_'), false);
    assert.equal(wompiServiceCode.includes('integrityKey'), false);
    assert.equal(wompiServiceCode.includes('/payments/wompi/initiate'), true);
  });

  it('no existe sha256.ts huérfano para firmar transacciones en el cliente móvil', () => {
    const shaPath = path.join(__dirname, '../modules/reservation/services/sha256.ts');
    assert.equal(fs.existsSync(shaPath), false);
  });

  it('el retorno de pago en payment-response.tsx preserva la referencia real ante referencias PAY- del servidor', () => {
    const responseCode = fs.readFileSync(
      path.join(__dirname, '../app/payment-response.tsx'),
      'utf8'
    );
    assert.ok(responseCode.includes('!tx.reference.startsWith("PAY-")'));
  });
});

