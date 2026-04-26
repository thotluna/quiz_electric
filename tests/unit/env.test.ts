import test from 'node:test';
import assert from 'node:assert';

/**
 * Unit test to verify the test environment configuration.
 * This ensures that the expert's point #3 is correctly implemented.
 */
test('Environment Configuration', async (t) => {
  
  await t.test('should have ENABLE_SUPABASE_MOCK set to true in test environment', () => {
    // This variable must be true for our Global Mock to work
    const isMockEnabled = process.env.ENABLE_SUPABASE_MOCK;
    assert.strictEqual(isMockEnabled, 'true', 'ENABLE_SUPABASE_MOCK is not enabled. Check your .env.test file.');
  });

  await t.test('should have a valid testing NODE_ENV', () => {
    assert.strictEqual(process.env.NODE_ENV, 'test', 'NODE_ENV should be set to test');
  });

  await t.test('should have mock supabase credentials', () => {
    assert.ok(process.env.NEXT_PUBLIC_SUPABASE_URL, 'Supabase URL should be present');
    assert.match(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, /test-anon-key/, 'Anon key should be the testing placeholder');
  });
});
