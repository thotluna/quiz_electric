import { test, expect } from '@playwright/test';

/**
 * Test de flujo completo del Quiz
 */
test.describe('Quiz Flow', () => {
  
  test('should complete a 10 questions timed quiz', async ({ page }) => {
    // 1. Navegar a la home con bypass de auth
    await page.goto('/?test_session=true');
    
    // 2. Verificar que estamos en la pantalla de setup
    await expect(page.getByText('Selecciona el modo de prueba')).toBeVisible();
    
    // 3. Seleccionar modo Timed (10 preguntas)
    await page.click('[id="mode-timed"]');
    
    // 4. Seleccionar un tema (ITC-BT-01)
    await page.click('[id="topic-ITC-BT-01"]');
    
    // 5. Iniciar Quiz
    await page.click('[id="btn-start-quiz"]');
    
    // 6. Responder la primera pregunta (que sabemos es simple del mock)
    // Buscamos opciones y verificamos que hay al menos 2
    await expect(page.locator('[id^="option-"]').first()).toBeVisible();
    const optionsCount = await page.locator('[id^="option-"]').count();
    expect(optionsCount).toBeGreaterThanOrEqual(2);
    
    await page.locator('[id^="option-"]').first().click();
    
    // 7. Click en Comprobar y Continuar
    await page.click('[id="btn-next"]');
    
    // 8. Verificar que se muestra el feedback (correct/incorrect)
    // En el mock la opción 1 es correcta
    await expect(page.getByText('Correcto')).toBeVisible();
    
    // 9. Esperar el auto-avance o forzarlo haciendo click de nuevo
    await page.click('[id="btn-next"]');
    
    // 10. Deberíamos estar en la siguiente pregunta
    await expect(page.getByText('Progreso').locator('..').getByText(/2\/\d+/)).toBeVisible();

    // 11. Saltar una pregunta
    await page.click('[id="btn-skip"]');
    
    // 12. Deberíamos estar en la pregunta 3
    await expect(page.getByText('Progreso').locator('..').getByText(/3\/\d+/)).toBeVisible();
  });

  test('should handle multiple choice questions correctly', async ({ page }) => {
    await page.goto('/?test_session=true');
    await page.click('[id="mode-infinite"]');
    await page.click('[id="topic-ITC-BT-01"]');
    await page.click('[id="btn-start-quiz"]');

    // Buscamos la pregunta múltiple (en el mock es la q2)
    // Saltamos la q1
    await page.click('[id="btn-skip"]');

    // Ahora estamos en q2 (múltiple)
    await expect(page.getByText('Pregunta 2 (Múltiple')).toBeVisible();

    // Seleccionamos dos opciones (10 y 11)
    await page.locator('[id="option-10"]').click();
    await page.locator('[id="option-11"]').click();

    // Evaluamos
    await page.click('[id="btn-next"]');

    // Feedback correcto
    await expect(page.getByText('Correcto')).toBeVisible();
  });

  test('should persist session on refresh', async ({ page }) => {
    await page.goto('/?test_session=true');
    await page.click('[id="mode-standard"]');
    await page.click('[id="btn-start-quiz"]');
    
    // Responder la primera
    await page.locator('[id^="option-"]').first().click();
    await page.click('[id="btn-next"]');
    await page.click('[id="btn-next"]'); // Avanzar a la 2
    
    // Refrescar
    await page.reload();
    
    // Debería aparecer el modal de reanudación
    await expect(page.getByText('¿Deseas continuar donde lo dejaste?')).toBeVisible();
    
    // Aceptar
    await page.click('button:has-text("Continuar Simulacro")');
    
    // Debería estar en la pregunta 2
    await expect(page.getByText('Progreso').locator('..').getByText(/2\/\d+/)).toBeVisible();
  });
});
