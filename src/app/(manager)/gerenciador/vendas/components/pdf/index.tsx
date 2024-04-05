import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    color: '#000',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    margin: 10,
    padding: 10,
    flex: 1,
  },
  viewer: {
    width: '100vw',
    height: '100vh',
    position: 'absolute',
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: 800,
  },
  listItem: {
    padding: 4,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 14,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
})

interface Props {
  products: { name: string; price: string; amount: number; id: string }[]
  total: string
}

export function BasicDocument({ products, total }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Produtos</Text>

          <View style={styles.list}>
            {products.map((product) => {
              return (
                <View
                  key={product.id}
                  style={[styles.listItem, { backgroundColor: '#eee' }]}
                >
                  <Text style={styles.itemText}>
                    {`${product.amount}x ${product.name}`}
                  </Text>
                  <Text style={styles.itemText}>{product.price}</Text>
                </View>
              )
            })}
          </View>

          <View style={[styles.listItem, { marginTop: 'auto' }]}>
            <Text style={styles.itemText}>Total</Text>
            <Text style={styles.itemText}>{total}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
