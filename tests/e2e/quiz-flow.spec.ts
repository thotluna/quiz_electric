import { test, expect } from '@playwright/test';
import mockDb from '../mocks/db.mock.json';

test.describe('Quiz Flow - Timed Mode', () => {
  test.beforeEach(async ({ page, context }) => {
    // Inyectamos las preguntas de prueba antes de que cargue el JS de la página
    await page.addInitScript((data) => {
      (window as any)['__MOCK_QUESTIONS__'] = data;
    }, mockDb);

    // Mockeamos Supabase Auth
    await page.route('**/auth/v1/user*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'test-user-123', email: 'test@example.com' }),
      });
    });

    // Mockeamos Supabase Stats (GET)
    await page.route('**/rest/v1/user_question_stats*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      } else {
        await route.continue();
      }
    });

    // Mockeamos Supabase Stats (UPSERT/POST)
    await page.route('**/rest/v1/user_question_stats*', async (route) => {
      if (route.request().method() === 'POST' || route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });

    // Seteamos la cookie para que el servidor reconozca el modo test
    await context.addCookies([{
      name: 'test_session',
      value: 'true',
      url: 'http://localhost:3000'
    }]);

    await page.goto('/?test_session=true');
  });

  test('completes a timed quiz with skips and correct/incorrect answers', async ({ page }) => {
    await page.click('[data-testid="topic-itc-01"]');
    await page.click('[data-testid="mode-timed"]');
    await page.click('[data-testid="btn-start-quiz"]');

    // Q1: Correcta
    await expect(page.locator('text=Pregunta 1')).toBeVisible({ timeout: 15000 });
    await page.click('[data-testid="option-101"]');
    await page.click('[data-testid="btn-next"]');
    await expect(page.locator('text=Correcto')).toBeVisible();
    await page.click('[data-testid="btn-next"]');

    // Q2: Incorrecta
    await expect(page.locator('text=Pregunta 2')).toBeVisible();
    await page.click('[data-testid="option-201"]');
    await page.click('[data-testid="btn-next"]');
    await expect(page.locator('text=Incorrecto')).toBeVisible();
    await page.click('[data-testid="btn-next"]');

    // Q3: Saltar
    await expect(page.locator('text=Pregunta 3')).toBeVisible();
    await page.click('[data-testid="btn-skip"]');

    // Responder Q4 a Q8
    const answers = [
      { q: 4, opt: 401, correct: false }, 
      { q: 5, opt: 501, correct: true }, 
      { q: 6, opt: 601, correct: false },
      { q: 7, opt: 703, correct: true }, 
      { q: 8, opt: 804, correct: true }
    ];

    for (const step of answers) {
      await expect(page.locator(`text=Pregunta ${step.q}`)).toBeVisible();
      await page.click(`[data-testid="option-${step.opt}"]`);
      await page.click('[data-testid="btn-next"]');
      if (step.correct) {
        await expect(page.locator('text=Correcto')).toBeVisible();
      } else {
        await expect(page.locator('text=Incorrecto')).toBeVisible();
      }
      await page.click('[data-testid="btn-next"]');
    }

    // Q9: Múltiple (Correcta)
    await expect(page.locator('text=Pregunta 9')).toBeVisible();
    await page.click('[data-testid="option-901"]');
    await page.click('[data-testid="option-903"]');
    await page.click('[data-testid="btn-next"]');
    await expect(page.locator('text=Correcto')).toBeVisible();
    await page.click('[data-testid="btn-next"]');

    // Q10: Múltiple (Incorrecta parcial)
    await expect(page.locator('text=Pregunta 10')).toBeVisible();
    await page.click('[data-testid="option-1001"]');
    await page.click('[data-testid="btn-next"]');
    await expect(page.locator('text=Incorrecto')).toBeVisible();
    await page.click('[data-testid="btn-next"]');

    // Volvemos a la Q3 (saltada)
    await expect(page.locator('text=Pregunta 3')).toBeVisible();
    await expect(page.locator('[data-testid="btn-finish"]')).toBeVisible();
    await page.click('[data-testid="option-303"]');
    await page.click('[data-testid="btn-next"]');
    await page.click('[data-testid="btn-next"]');

    await expect(page.locator('text=¡Simulacro Finalizado!')).toBeVisible();
  });

  test('completes a standard simulacrum (10 questions) quiz', async ({ page }) => {
    await page.click('[data-testid="topic-itc-01"]');
    await page.click('[data-testid="mode-standard"]');
    await page.click('[data-testid="btn-start-quiz"]');

    // Responder 1 a 8 correctamente
    for (let i = 1; i <= 8; i++) {
      const correctOpts: Record<number, number> = {
        1: 101, 2: 202, 3: 303, 4: 404, 5: 501, 6: 602, 7: 703, 8: 804
      };
      await page.click(`[data-testid="option-${correctOpts[i]}"]`);
      await page.click('[data-testid="btn-next"]');
      await page.click('[data-testid="btn-next"]');
    }

    // Q9 (Múltiple)
    await page.click('[data-testid="option-901"]');
    await page.click('[data-testid="option-903"]');
    await page.click('[data-testid="btn-next"]');
    await page.click('[data-testid="btn-next"]');

    // Q10 (Múltiple)
    await page.click('[data-testid="option-1001"]');
    await page.click('[data-testid="option-1002"]');
    await page.click('[data-testid="option-1004"]');
    await page.click('[data-testid="btn-next"]');
    
    await expect(page.locator('[data-testid="btn-finish"]')).toBeVisible();
    await page.click('[data-testid="btn-next"]');

    await expect(page.locator('text=¡Simulacro Finalizado!')).toBeVisible();
    await expect(page.getByText('APTO')).toBeVisible();
  });

  test('handles multiple choice questions with proportional scoring', async ({ page }) => {
    await page.click('[data-testid="topic-itc-01"]');
    await page.click('[data-testid="mode-standard"]');
    await page.click('[data-testid="btn-start-quiz"]');

    // Saltar las 8 primeras
    for (let i = 1; i <= 8; i++) {
      await page.click('[data-testid="btn-skip"]');
    }

    // Q9 (Múltiple: 901 y 903 son correctas)
    await expect(page.locator('text=Pregunta 9')).toBeVisible();
    await page.click('[data-testid="option-901"]');
    await page.click('[data-testid="option-903"]');
    await page.click('[data-testid="btn-next"]');
    await expect(page.locator('text=Correcto')).toBeVisible();
    await page.click('[data-testid="btn-next"]');

    // Q10 (Múltiple: 1001, 1002 y 1004 son correctas)
    await expect(page.locator('text=Pregunta 10')).toBeVisible();
    await page.click('[data-testid="option-1001"]');
    await page.click('[data-testid="option-1003"]'); // Incorrecta
    await page.click('[data-testid="btn-next"]');
    await expect(page.locator('text=Incorrecto')).toBeVisible();
    await expect(page.locator('text=Mal 3')).toBeVisible();
    
    await expect(page.locator('[data-testid="btn-finish"]')).toBeVisible();
    await page.click('[data-testid="btn-finish"]');

    await expect(page.locator('text=¡Simulacro Finalizado!')).toBeVisible();
  });
});
