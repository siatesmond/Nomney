import { Image, Text, View, StyleSheet } from 'react-native';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type AvatarProps = {
  avatarUrl: string | null;
  displayName: string;
  size?: AvatarSize;
  shadow?: boolean;
  borderWidth?: number;
  borderColor?: string;
};

export function Avatar({ 
  avatarUrl, 
  displayName, 
  size = 'lg',
  shadow = true,
  borderWidth = 0,
  borderColor = '#fff',
}: AvatarProps) {
  const sizeStyle = SIZES[size];
  
  return (
    <View 
      style={[
        styles.avatarWrapper, 
        sizeStyle.wrapper,
        shadow && styles.shadow,
        borderWidth > 0 && { borderWidth, borderColor },
      ]}
    >
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback, sizeStyle.fallback]}>
          <Text style={[styles.avatarInitials, sizeStyle.text]}>
            {displayName[0].toUpperCase()}
          </Text>
        </View>
      )}
    </View>
  );
}

const SIZES = {
  xs: {
    wrapper: { width: 32, height: 32, borderRadius: 16 },
    fallback: { backgroundColor: '#F4522A' },
    text: { fontSize: 12, fontWeight: '700' as const },
  },
  sm: {
    wrapper: { width: 48, height: 48, borderRadius: 24 },
    fallback: { backgroundColor: '#F4522A' },
    text: { fontSize: 18, fontWeight: '700' as const },
  },
  md: {
    wrapper: { width: 64, height: 64, borderRadius: 32 },
    fallback: { backgroundColor: '#F4522A' },
    text: { fontSize: 24, fontWeight: '700' as const },
  },
  lg: {
    wrapper: { width: 96, height: 96, borderRadius: 48 },
    fallback: { backgroundColor: '#F4522A' },
    text: { fontSize: 36, fontWeight: '700' as const },
  },
  xl: {
    wrapper: { width: 128, height: 128, borderRadius: 64 },
    fallback: { backgroundColor: '#F4522A' },
    text: { fontSize: 48, fontWeight: '700' as const },
  },
};

const styles = StyleSheet.create({
  avatarWrapper: {
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontWeight: '700',
  },
});