import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test de flujo completo del Quiz
 * Utilizamos un bypass de sesión para testing habilitado en app/page.tsx
 * que se activa con el parámetro query ?test_session=true
 *
 * Los mocks se inyectan via addInitScript para NO contaminar código de producción.
 * Todas las preguntas del mock tienen la primera opción como correcta.
 */
test.describe('Quiz Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    const mockPath = path.join(process.cwd(), 'tests/mocks/db.mock.json');
    const mockData = JSON.parse(fs.readFileSync(mockPath, 'utf-8'));
    
    await page.addInitScript((data: unknown) => {
      (window as unknown as Record<string, unknown>).__MOCK_QUESTIONS__ = data;
    }, mockData);
  });

  test('should complete a 10 questions timed quiz', async ({ page }) => {
    await page.goto('/?test_session=true');
    await expect(page.getByText('Selecciona el modo de prueba')).toBeVisible();
    await page.click('[id="mode-timed"]');
    await page.click('[id="topic-ITC-BT-01"]');
    await page.click('[id="btn-start-quiz"]');
    
    await expect(page.locator('[id^="option-"]').first()).toBeVisible();
    await page.locator('[id^="option-"]').first().click();
    await page.click('[id="btn-next"]');
    await expect(page.getByText('Correcto')).toBeVisible();
    await page.click('[id="btn-next"]');
    
    await expect(page.getByText('Progreso').locator('..').getByText('2/10')).toBeVisible();
    await page.click('[id="btn-skip"]');
    await expect(page.getByText('Progreso').locator('..').getByText('3/10')).toBeVisible();
  });

  test('should handle multiple choice questions correctly', async ({ page }) => {
    await page.goto('/?test_session=true');
    await page.click('[id="mode-infinite"]');
    await page.click('[id="topic-ITC-BT-01"]');
    await page.click('[id="btn-start-quiz"]');

    let attempts = 0;
    while (!(await page.getByText('Selección Múltiple').isVisible()) && attempts < 10) {
      await page.click('[id="btn-skip"]');
      attempts++;
    }

    if (await page.getByText('Selección Múltiple').isVisible()) {
      await page.locator('[id="option-10"]').click();
      await page.locator('[id="option-11"]').click();
      await expect(page.locator('[id="option-10"]')).toHaveClass(/border-accent-primary/);
      await expect(page.locator('[id="option-11"]')).toHaveClass(/border-accent-primary/);
      await page.click('[id="btn-next"]');
      await expect(page.getByText('Correcto')).toBeVisible();
    }
  });

  test('should persist session on refresh', async ({ page }) => {
    await page.goto('/?test_session=true');
    await page.click('[id="mode-standard"]');
    await page.click('[id="topic-ITC-BT-01"]');
    await page.click('[id="btn-start-quiz"]');
    
    await page.locator('[id^="option-"]').first().click();
    await page.click('[id="btn-next"]');
    await page.click('[id="btn-next"]');
    
    await page.waitForTimeout(500);
    await page.reload();
    
    await expect(page.getByText('Test sin terminar')).toBeVisible({ timeout: 10000 });
    await page.click('button:has-text("Continuar Simulacro")');
    await expect(page.getByText('Progreso').locator('..').getByText('2/10')).toBeVisible();
  });
});
