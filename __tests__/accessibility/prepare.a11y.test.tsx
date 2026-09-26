import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import PreparePage from '@/app/prepare/page';

expect.extend(toHaveNoViolations);

describe('Prepare Page Accessibility', () => {
  test('should have zero accessibility violations', async () => {
    const { container } = render(<PreparePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
