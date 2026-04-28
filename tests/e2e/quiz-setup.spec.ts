import { test, expect } from '@playwright/test';

test.describe('Quiz Configuration and Setup', () => {
  test.beforeEach(async ({ page }) => {
    // Para estas pruebas E2E, asumimos que el middleware o la sesión se manejan.
    // Si falla por redirección a /login, deberíamos mockear la sesión de Supabase.
    await page.goto('/');
  });

  test('should have default config: 50 Questions and All Topics', async ({ page }) => {
    // 1. Verificar Modo por defecto (50 Preguntas / Standard)
    const standardModeBtn = page.getByRole('button', { name: /50 Preguntas/i });
    await expect(standardModeBtn).toBeVisible();
    
    // Verificamos que tenga la clase de seleccionado (bg-primary)
    // El componente ButtonMode usa template literals para las clases.
    await expect(standardModeBtn).toHaveClass(/bg-primary/);

    // 2. Verificar Temas por defecto (Todo el REBT)
    const allTopicsBtn = page.getByRole('button', { name: /Todo el REBT/i });
    await expect(allTopicsBtn).toBeVisible();
    await expect(allTopicsBtn).toHaveClass(/bg-primary/);
  });

  test('should navigate to quiz page with correct params', async ({ page }) => {
    // 1. Hacer clic en el botón de empezar
    const startBtn = page.getByRole('button', { name: /EMPEZAR SIMULACRO PROFESIONAL/i });
    await expect(startBtn).toBeVisible();
    
    await startBtn.click();

    // 2. Verificar navegación a /quiz con params por defecto
    await expect(page).toHaveURL(/\/quiz\?mode=standard/);

    // 3. Verificar que el QuizManager se inicializa (buscamos el texto de carga o el primer elemento del quiz)
    // Como es Server-First, debería aparecer rápido o mostrar el skeleton de carga
    const loadingText = page.getByText(/Preparando simulacro/i);
    const quizContent = page.locator('main');
    
    await expect(quizContent).toBeVisible();
  });

  test('should change mode and update URL on navigation', async ({ page }) => {
    // 1. Cambiar a modo Contrarreloj
    const timedModeBtn = page.getByRole('button', { name: /Contrarreloj/i });
    await timedModeBtn.click();
    
    // Verificar visualmente
    await expect(timedModeBtn).toHaveClass(/bg-primary/);

    // 2. Empezar
    await page.getByRole('button', { name: /EMPEZAR SIMULACRO PROFESIONAL/i }).click();

    // 3. Verificar URL
    await expect(page).toHaveURL(/\/quiz\?mode=timed/);
  });

  test('should select a specific topic and update URL', async ({ page }) => {
    // 1. Seleccionar un tema (ej: ITC-BT 01)
    // Buscamos un botón de ITC que no sea el de "Todo el REBT"
    const itc01Btn = page.getByRole('button', { name: /ITC-BT 01/i }).first();
    
    // Si el tema está disponible, lo clicamos
    if (await itc01Btn.isEnabled()) {
      await itc01Btn.click();
      
      // 2. Empezar
      await page.getByRole('button', { name: /EMPEZAR SIMULACRO PROFESIONAL/i }).click();

      // 3. Verificar URL (debe contener el parámetro topics)
      await expect(page).toHaveURL(/.*topics=.*/);
    }
  });
});
