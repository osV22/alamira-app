import { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';

import { TextInput } from '@alamira/ui/src/components/TextInput';
import { Button } from '@alamira/ui/src/components/Button';

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
      <Pressable
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        onPress={onClose}
      >
        <Pressable
          className="w-80 rounded-xl border border-border bg-surface p-6"
          onPress={() => {}}
        >
          <Text className="text-lg font-semibold text-foreground mb-4">
            Rename Device
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Device name"
            autoFocus
            selectTextOnFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
            className="mb-6"
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button variant="outline" onPress={onClose}>
                Cancel
              </Button>
            </View>
            <View className="flex-1">
              <Button variant="solid" disabled={isSaveDisabled} onPress={handleSave}>
                Save
              </Button>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
