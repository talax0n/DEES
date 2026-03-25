import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const BULAN_NAMES = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                     'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 9 },
  title: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginBottom: 3 },
  subtitle: { fontSize: 10, textAlign: 'center', marginBottom: 20 },
  categoryTitle: { fontSize: 10, fontWeight: 'bold', marginTop: 12, marginBottom: 4, backgroundColor: '#e5e7eb', padding: '4 6' },
  table: { width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#d1d5db' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6' },
  tableRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  col1: { width: '12%', padding: '3 4' },
  col2: { width: '10%', padding: '3 4' },
  col3: { width: '30%', padding: '3 4' },
  col4: { width: '12%', padding: '3 4' },
  col5: { width: '36%', padding: '3 4' },
  headerText: { fontWeight: 'bold', fontSize: 8 },
  cellText: { fontSize: 8 },
  footer: { marginTop: 20, fontSize: 8 },
  footerTitle: { fontWeight: 'bold', marginBottom: 3 },
})

const KATEGORI_ORDER = ['Ibadah Raya', 'Ibadah Pelkat', 'Kegiatan Khusus', 'Katekisasi']

type Assignment = {
  member: { nama: string }
  role: string
}

type Event = {
  id: string
  namaEvent: string
  tanggal: Date
  waktu: string
  kategori: string
  keterangan: string | null
  assignments: Assignment[]
}

type Period = {
  nama: string
  bulan: number
  tahun: number
  events: Event[]
}

function formatTanggal(date: Date) {
  const d = new Date(date)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
}

export function SchedulePDF({ period }: { period: Period }) {
  const eventsByKategori = KATEGORI_ORDER.reduce((acc, kat) => {
    acc[kat] = period.events.filter(e => e.kategori === kat)
    return acc
  }, {} as Record<string, Event[]>)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          JADWAL PELAYANAN TIM MULTIMEDIA {BULAN_NAMES[period.bulan].toUpperCase()} {period.tahun}
        </Text>
        <Text style={styles.subtitle}>{"GPIB 'DAMAI SEJAHTERA' CILEUNGSI"}</Text>

        {KATEGORI_ORDER.map(kat => {
          const events = eventsByKategori[kat]
          if (!events || events.length === 0) return null
          return (
            <View key={kat}>
              <Text style={styles.categoryTitle}>{kat.toUpperCase()}</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <View style={styles.col1}><Text style={styles.headerText}>Tanggal</Text></View>
                  <View style={styles.col2}><Text style={styles.headerText}>Waktu</Text></View>
                  <View style={styles.col3}><Text style={styles.headerText}>Pelayan</Text></View>
                  <View style={styles.col4}><Text style={styles.headerText}>Role</Text></View>
                  <View style={styles.col5}><Text style={styles.headerText}>Keterangan</Text></View>
                </View>
                {events.map(event => (
                  <View key={event.id} style={styles.tableRow}>
                    <View style={styles.col1}><Text style={styles.cellText}>{formatTanggal(event.tanggal)}</Text></View>
                    <View style={styles.col2}><Text style={styles.cellText}>{event.waktu}</Text></View>
                    <View style={styles.col3}>
                      {event.assignments.map((a, i) => (
                        <Text key={i} style={styles.cellText}>{a.member.nama}</Text>
                      ))}
                    </View>
                    <View style={styles.col4}>
                      {event.assignments.map((a, i) => (
                        <Text key={i} style={styles.cellText}>{a.role}</Text>
                      ))}
                    </View>
                    <View style={styles.col5}><Text style={styles.cellText}>{event.keterangan ?? ''}</Text></View>
                  </View>
                ))}
              </View>
            </View>
          )
        })}

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Keterangan Role:</Text>
          <Text>SLD = Operator Slide  |  SND = Operator Sound  |  STR = Streamer  |  CAM = Cameraman</Text>
        </View>
      </Page>
    </Document>
  )
}
