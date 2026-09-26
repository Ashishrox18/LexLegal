import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import DecodePage from '@/app/decode/page';

expect.extend(toHaveNoViolations);

describe('Decode Page Accessibility', () => {
  test('should have zero accessibility violations in idle upload state', async () => {
    const { container } = render(<DecodePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
