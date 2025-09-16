// Test basique pour vérifier que Jest fonctionne
describe('Basic Test Setup', () => {
  it('should run a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have access to environment variables', () => {
    expect(process.env.JWT_SECRET).toBe('test-jwt-secret-key-for-testing-only');
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should be able to use async/await', async () => {
    const promise = new Promise(resolve => {
      setTimeout(() => resolve('done'), 100);
    });
    
    const result = await promise;
    expect(result).toBe('done');
  });
});
