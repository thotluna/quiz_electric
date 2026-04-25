import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test de flujo completo del Quiz
 * Utilizamos un bypass de sesión para testing habilitado en app/page.tsx
 * que se activa con el parámetro query ?test_session=true
 */
test.describe('Quiz Flow', () => {
  
  test('should complete a 10 questions timed quiz', async ({ page }) => {
    // 1. Navegar a la home con bypass de auth
    await page.goto('/?test_session=true');
    
    // 2. Verificar que estamos en la pantalla de setup
    await expect(page.getByText('Selecciona el modo de prueba')).toBeVisible();
    
    // 3. Seleccionar modo contrarreloj (10 preguntas)
    await page.click('[id="mode-timed"]');
    
    // 4. Seleccionar un tema específico (ITC-BT 01) para asegurar determinismo
    await page.click('[id="topic-ITC-BT-01"]');
    
    // 5. Iniciar quiz
    await page.click('[id="btn-start-quiz"]');
    
    // 6. Responder la primera pregunta (que sabemos es simple del mock)
    // Buscamos una opción y hacemos click
    await expect(page.locator('[id^="option-"]')).toHaveCount(3);
    await page.locator('[id="option-1"]').click();
    
    // 7. Click en Comprobar y Continuar
    await page.click('[id="btn-next"]');
    
    // 8. Verificar que se muestra el feedback (correct/incorrect)
    // En el mock la opción 1 es correcta
    await expect(page.getByText('Correcto')).toBeVisible();
    
    // 9. Esperar el auto-avance o forzarlo haciendo click de nuevo
    await page.click('[id="btn-next"]');
    
    // 10. Deberíamos estar en la siguiente pregunta
    await expect(page.getByText('Progreso').locator('..').getByText('2/10')).toBeVisible();

    // 11. Saltar una pregunta
    await page.click('[id="btn-skip"]');
    
    // 12. Deberíamos estar en la pregunta 3
    await expect(page.getByText('Progreso').locator('..').getByText('3/10')).toBeVisible();
  });

  test('should handle multiple choice questions correctly', async ({ page }) => {
    await page.goto('/?test_session=true');
    await page.click('[id="mode-infinite"]');
    await page.click('[id="topic-ITC-BT-01"]');
    await page.click('[id="btn-start-quiz"]');

    // Navegamos hasta encontrar la pregunta múltiple (id 4 en mock)
    // El store las baraja, así que simplemente buscamos el badge de "Selección Múltiple"
    let attempts = 0;
    while (!(await page.getByText('Selección Múltiple').isVisible()) && attempts < 5) {
      await page.click('[id="btn-skip"]');
      attempts++;
    }

    if (await page.getByText('Selección Múltiple').isVisible()) {
      // Seleccionar varias opciones (10, 11 son correctas en mock)
      await page.locator('[id="option-10"]').click();
      await page.locator('[id="option-11"]').click();
      
      // Comprobar que ambas siguen seleccionadas (estilo checkbox)
      await expect(page.locator('[id="option-10"]')).toHaveClass(/border-accent-primary/);
      await expect(page.locator('[id="option-11"]')).toHaveClass(/border-accent-primary/);
      
      await page.click('[id="btn-next"]');
      await expect(page.getByText('Correcto')).toBeVisible();
    }
  });

  test('should persist session on refresh', async ({ page }) => {
    await page.goto('/?test_session=true');
    await page.click('[id="mode-standard"]');
    await page.click('[id="btn-start-quiz"]');
    
    // Responder la primera
    await page.locator('[id^="option-"]').first().click();
    await page.click('[id="btn-next"]');
    await page.click('[id="btn-next"]'); // Avanzar a pregunta 2
    
    // Recargar página
    await page.reload();
    
    // Debería aparecer el modal de reanudación
    await expect(page.getByText('Test sin terminar')).toBeVisible();
    
    // Continuar
    await page.click('button:has-text("Continuar Simulacro")');
    
    // Deberíamos estar en la pregunta 2
    await expect(page.getByText('Progreso').locator('..').getByText('2/50')).toBeVisible();
  });
});
