import { View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps extends ViewProps {
  padded?: boolean;
}

export function ScreenContainer({ padded = true, className, children, ...props }: ScreenContainerProps) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <View
        className={`flex-1 bg-background ${padded ? 'px-4 pt-2 pb-24' : ''} ${className ?? ''}`}
        {...props}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
