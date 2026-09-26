import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import LandingPage from '@/app/page';

expect.extend(toHaveNoViolations);

describe('Landing Page Accessibility', () => {
  test('should have zero accessibility violations', async () => {
    const { container } = render(<LandingPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
