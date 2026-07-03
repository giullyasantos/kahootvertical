import { expect, test } from '@playwright/test';

test('portal, registration, onboarding, participant, captain, and admin mock flows work', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'DESPERTA!' })).toBeVisible();
  await page.getByRole('link', { name: /Inscrever participante/i }).click();
  await expect(page).toHaveURL(/\/register$/);

  await page.getByRole('button', { name: /Enviar inscricao/i }).click();
  await expect(page.getByText('Campo obrigatorio.').first()).toBeVisible();
  await page.locator('input').nth(1).fill('Lucas Teste');
  await page.locator('input').nth(2).fill('17');
  await page.locator('input').nth(3).fill('(407) 555-0101');
  await page.locator('input').nth(4).fill('Mae Teste');
  await page.locator('input').nth(5).fill('(407) 555-0102');
  await page.getByRole('button', { name: 'Video' }).click();
  await page.locator('input[type="file"]').nth(0).setInputFiles({
    name: 'face.png',
    mimeType: 'image/png',
    buffer: Buffer.from('fake-face'),
  });
  await page.locator('input[type="file"]').nth(1).setInputFiles({
    name: 'proof.png',
    mimeType: 'image/png',
    buffer: Buffer.from('fake-proof'),
  });
  await page.getByLabel(/Ja fiz o pagamento/i).check();
  await page.getByRole('button', { name: /Enviar inscricao/i }).click();
  await expect(page.getByRole('heading', { name: /Bora despertar/i })).toBeVisible();

  await page.goto('/onboarding');
  await page.getByRole('button', { name: /Concluir Telefone/i }).click();
  await page.getByRole('button', { name: 'A2' }).click();
  await page.getByRole('button', { name: /Concluir Tela inicial/i }).click();
  await page.getByRole('button', { name: /Concluir Avisos/i }).click();
  await expect(page.getByText('Progresso: 4/4')).toBeVisible();

  await page.goto('/app/notes');
  await page.getByRole('button', { name: 'Time' }).click();
  await page.getByLabel(/Editor de notas/i).fill('Jesus falou comigo na mensagem.');
  await page.getByRole('button', { name: /Salvar nota/i }).click();
  await expect(page.getByText('Jesus falou comigo na mensagem.').first()).toBeVisible();

  await page.goto('/app/profile');
  await page.getByRole('button', { name: 'A2' }).click();
  await expect(page.getByText(/Avatar escolhido: A2/i)).toBeVisible();

  await page.goto('/captain');
  await page.getByLabel(/Resposta da pista/i).fill('desperta');
  await page.getByRole('button', { name: /Enviar resposta/i }).click();
  await expect(page.getByText(/Resposta aceita/i)).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({
    name: 'team-video.mp4',
    mimeType: 'video/mp4',
    buffer: Buffer.from('fake-video'),
  });
  await expect(page.getByText(/team-video.mp4/i).first()).toBeVisible();

  await page.goto('/admin/meals');
  await page.getByRole('button', { name: /Food served/i }).click();
  await expect(page.getByRole('button', { name: /Saved/i }).first()).toBeVisible();

  await page.goto('/admin/registrations');
  await page.getByRole('button', { name: 'Aprovar' }).first().click();
  await expect(page.getByText(/status: approved/i).first()).toBeVisible();

  await page.goto('/admin/points');
  await page.getByLabel('Motivo').fill('Teste Playwright');
  await page.getByLabel('Pontos').fill('77');
  await page.getByRole('button', { name: /Adicionar/i }).click();
  await expect(page.getByText('Teste Playwright')).toBeVisible();

  await page.goto('/admin/notifications');
  await page.getByLabel('Titulo').fill('Aviso teste');
  await page.getByLabel('Mensagem').fill('Mensagem de teste enviada.');
  await page.getByRole('button', { name: /Enviar aviso mock/i }).click();
  await expect(page.getByText('Aviso teste')).toBeVisible();

  await page.goto('/admin/submissions');
  await page.getByLabel('Votos Instagram').fill('42');
  await page.getByRole('button', { name: /Salvar bonus/i }).click();
  await expect(page.getByText(/42 votos/i).first()).toBeVisible();

  await page.goto('/admin/presenter');
  await page.getByRole('button', { name: 'leaderboard' }).click();
  await expect(page.getByRole('heading', { name: 'leaderboard' })).toBeVisible();
});
