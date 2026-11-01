require('./setupTestEnv.js');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

describe('Mobile Reservation Service Validation Tests', () => {
  it('no desplaza silenciosamente las fechas de devolución +24h', () => {
    const code = fs.readFileSync(
      path.join(__dirname, '../modules/reservation/services/reservationPersistService.ts'),
      'utf8'
    );
    assert.equal(code.includes('24 * 60 * 60 * 1000'), false);
    assert.ok(code.includes('throw new Error("La fecha de devolución debe ser posterior a la fecha de retiro.")'));
  });
});
