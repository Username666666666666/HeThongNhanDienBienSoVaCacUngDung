import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface DashboardStat {
  label: string;
  value: string;
}

interface DashboardAction {
  title: string;
  description: string;
  onPress: () => void;
}

interface DashboardTemplateProps {
  title: string;
  welcome: string;
  stats: DashboardStat[];
  actions: DashboardAction[];
}

export const DashboardTemplate = ({ title, welcome, stats, actions }: DashboardTemplateProps) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.welcome}>{welcome}</Text>

      <View style={styles.statsContainer}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionsContainer}>
        {actions.map((action) => (
          <TouchableOpacity key={action.title} style={styles.actionCard} onPress={action.onPress}>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionDescription}>{action.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#eef2ff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  welcome: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563eb',
  },
  statLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#64748b',
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});
