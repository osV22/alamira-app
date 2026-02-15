import { View, Text, Pressable } from 'react-native';
import { Database, NetworkRight, MultiplePages, Link, EditPencil } from 'iconoir-react-native';

import { Card } from '@alamira/ui/src/components/Card';
import { colors } from '@alamira/ui/src/theme';
import type { DataConnection } from '../services/device/types';

interface ConnectionSectionProps {
  connections: DataConnection[];
  onLink: (type: 'signalk' | 'nmea2000' | 'nmea0183') => void;
  onEdit: (connection: DataConnection) => void;
}

interface ConnectionRowProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  status: string;
  isLinked: boolean;
  onPress: () => void;
  isLast?: boolean;
}

function ConnectionRow({ icon, label, badge, status, isLinked, onPress, isLast }: ConnectionRowProps) {
  return (
    <View className={`flex-row items-center py-3 ${isLast ? '' : 'border-b border-border'}`}>
      <View className="w-9 h-9 rounded-lg bg-surface-elevated items-center justify-center mr-3">
        {icon}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-foreground text-sm font-medium">{label}</Text>
          {badge && (
            <View
              className="px-3 py-1 rounded-md"
              style={{ backgroundColor: colors.primaryDim }}
            >
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>
                {badge}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-muted text-xs mt-0.5">{status}</Text>
      </View>

      <Pressable
        onPress={onPress}
        className="active:opacity-70 flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg"
        style={{ backgroundColor: colors.primaryMuted, borderWidth: 1, borderColor: colors.primaryDim }}
      >
        {isLinked ? (
          <EditPencil width={13} height={13} color={colors.primary} strokeWidth={2} />
        ) : (
          <Link width={13} height={13} color={colors.primary} strokeWidth={2} />
        )}
        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>
          {isLinked ? 'Edit' : 'Link'}
        </Text>
      </Pressable>
    </View>
  );
}

export function ConnectionSection({ connections, onLink, onEdit }: ConnectionSectionProps) {
  const signalkConn = connections.find((c) => c.type === 'signalk');
  const nmea2000Conn = connections.find((c) => c.type === 'nmea2000');
  const nmea0183Conns = connections.filter((c) => c.type === 'nmea0183');

  return (
    <View className="mb-6">
      <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-2 px-1">
        Data Connections
      </Text>
      <Card>
        <ConnectionRow
          icon={<Database width={18} height={18} color={colors.muted} strokeWidth={1.5} />}
          label="Signal K"
          badge="Recommended"
          status={signalkConn ? `${signalkConn.host}:${signalkConn.port}` : 'Not linked'}
          isLinked={!!signalkConn}
          onPress={() => (signalkConn ? onEdit(signalkConn) : onLink('signalk'))}
        />
        <ConnectionRow
          icon={<NetworkRight width={18} height={18} color={colors.muted} strokeWidth={1.5} />}
          label="NMEA 2000"
          status={nmea2000Conn ? `${nmea2000Conn.host}:${nmea2000Conn.port}` : 'Not linked'}
          isLinked={!!nmea2000Conn}
          onPress={() => (nmea2000Conn ? onEdit(nmea2000Conn) : onLink('nmea2000'))}
        />
        <ConnectionRow
          icon={<MultiplePages width={18} height={18} color={colors.muted} strokeWidth={1.5} />}
          label="NMEA 0183"
          status={
            nmea0183Conns.length > 0
              ? `${nmea0183Conns.length} ${nmea0183Conns.length === 1 ? 'source' : 'sources'} linked`
              : 'No sources'
          }
          isLinked={nmea0183Conns.length > 0}
          onPress={() =>
            nmea0183Conns.length > 0 ? onEdit(nmea0183Conns[0]) : onLink('nmea0183')
          }
          isLast
        />
      </Card>
    </View>
  );
}
