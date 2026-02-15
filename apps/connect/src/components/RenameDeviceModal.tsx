import { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Xmark } from 'iconoir-react-native';

import { TextInput } from '@alamira/ui/src/components/TextInput';
import { colors } from '@alamira/ui/src/theme';

interface RenameDeviceModalProps {
  visible: boolean;
  currentName: string;
  onSave: (newName: string) => void;
  onClose: () => void;
}

export function RenameDeviceModal({ visible, currentName, onSave, onClose }: RenameDeviceModalProps) {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (visible) setName(currentName);
  }, [visible, currentName]);

  const isSaveDisabled = name.trim() === '' || name.trim() === currentName;

  const handleSave = () => {
    if (!isSaveDisabled) {
      onSave(name.trim());
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
        {/* Dismiss overlay */}
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 40,
            }}
          >
            {/* Handle bar */}
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.disabled }} />
            </View>

            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground }}>Rename Device</Text>
              <Pressable onPress={onClose} style={{ padding: 4 }}>
                <Xmark width={22} height={22} color={colors.muted} strokeWidth={1.5} />
              </Pressable>
            </View>

            {/* Input */}
            <TextInput
              label="Device Name"
              value={name}
              onChangeText={setName}
              placeholder="Device name"
              autoFocus
              selectTextOnFocus
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />

            {/* Save button */}
            <Pressable
              onPress={handleSave}
              disabled={isSaveDisabled}
              style={{
                marginTop: 24,
                backgroundColor: isSaveDisabled ? colors.disabled : colors.primary,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                opacity: isSaveDisabled ? 0.5 : 1,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.background }}>Save</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
