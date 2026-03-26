import { expect, Page, test } from '@playwright/test';

async function completeOnboarding(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Bắt đầu' }).click();
  await page.locator('input[type="text"]').fill('Nguyen Minh An');
  await page.locator('input[type="date"]').fill('1992-07-14');
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.getByRole('button', { name: 'Nhẹ nhàng' }).click();
  await page.getByRole('button', { name: 'Hoàn tất thiết lập' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test('onboarding leads straight into the daily report flow', async ({ page }) => {
  await completeOnboarding(page);
  await expect(page.getByRole('heading', { name: 'Báo cáo thần số học hôm nay' })).toBeVisible();
  await expect(page.getByText('Bản tin dành cho hôm nay')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Thư viện báo cáo' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Kho lưu trữ các báo cáo đã phát hành' })).toHaveCount(0);
});

test('settings persist notification times after reload', async ({ page }) => {
  await completeOnboarding(page);
  await page.goto('/settings');
  const timeInputs = page.locator('input[type="time"]');
  await timeInputs.nth(0).fill('07:15');
  await timeInputs.nth(1).fill('20:45');
  await page.reload();
  await expect(timeInputs.nth(0)).toHaveValue('07:15');
  await expect(timeInputs.nth(1)).toHaveValue('20:45');
});

test('profile personal info can be edited and saved', async ({ page }) => {
  await completeOnboarding(page);
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Sửa thông tin cá nhân' }).click();
  await page.locator('input[type="text"]').fill('Nguyen Minh An Updated');
  await page.locator('input[type="date"]').fill('1991-06-12');
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page.getByText('Đã lưu thay đổi!')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Nguyen Minh An Updated' })).toBeVisible();
});
