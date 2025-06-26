import BottomStickyButton from '@/app/components/BottomStickyButton';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

describe('BottomStickyButton', () => {
  it('renders with the correct button text', () => {
    const { getByText } = render(
      <BottomStickyButton text="Submit" onPress={() => {}} />
    );

    expect(getByText('Submit')).toBeTruthy();
  });

  it('calls onPress when the button is pressed', () => {
    const mockPress = jest.fn();

    const { getByText } = render(
      <BottomStickyButton text="Continue" onPress={mockPress} />
    );

    fireEvent.press(getByText('Continue'));
    expect(mockPress).toHaveBeenCalled();
  });
});