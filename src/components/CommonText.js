import React from 'react';
import { Text, StyleSheet } from 'react-native';

const CommonText = ({
  title,
  children,
  textStyle = [16, 'normal', '#333'], // [fontSize, fontWeight, color]
  style,
  numberOfLines,
  onPress,
  ...props
}) => {
  const [fontSize, fontWeight, color] = textStyle;

  return (
    <Text
      style={[
        styles.text,
        {
          fontSize,
          fontWeight,
          color,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
      onPress={onPress}
      {...props}
    >
      {title || children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    // Default text styles
  },
});

export default CommonText;