import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import type { LogEntry } from '../types';

interface Props {
  logs: LogEntry[];
  onClear: () => void;
}

export function Console({ logs, onClear }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [logs.length]);

  return (
    <View className="flex-1 bg-black border border-gray-700 rounded-lg mt-4 overflow-hidden">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-800">
        <Text className="text-green-400 font-mono text-xs font-bold">
          CONSOLE ({logs.length})
        </Text>
        <Pressable onPress={onClear}>
          <Text className="text-gray-500 text-xs font-mono">CLEAR</Text>
        </Pressable>
      </View>

      {/* Log entries */}
      <ScrollView ref={scrollRef} className="flex-1 px-4 py-2">
        {logs.length === 0 ? (
          <Text className="text-gray-600 font-mono text-xs">
            Waiting for requests...
          </Text>
        ) : (
          logs.map((entry, i) => <LogLine key={i} entry={entry} />)
        )}
      </ScrollView>
    </View>
  );
}

function LogLine({ entry }: { entry: LogEntry }) {
  const time = new Date(entry.timestamp).toLocaleTimeString();
  const methodColor =
    entry.method === 'POST' ? 'text-yellow-400' : 'text-cyan-400';

  return (
    <View className="mb-2">
      <Text className="font-mono text-xs">
        <Text className="text-gray-500">{time} </Text>
        <Text className={methodColor}>{entry.method} </Text>
        <Text className="text-white">{entry.path}</Text>
      </Text>
      {entry.body != null && (
        <Text className="text-gray-400 font-mono text-xs ml-4">
          → {JSON.stringify(entry.body)}
        </Text>
      )}
      {entry.response != null && (
        <Text className="text-green-400 font-mono text-xs ml-4">
          ← {JSON.stringify(entry.response)}
        </Text>
      )}
    </View>
  );
}
