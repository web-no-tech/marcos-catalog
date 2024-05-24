import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    color: '#000',
  },
  header: {
    gap: 4,
    margin: 20,
    borderWidth: 1,
    borderColor: '#363636',
  },
  saleInfo: {
    fontSize: 12,
    padding: 4,
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
  seller: {
    name: string
    pix: string
    bank: string
  }
  customer: string
}

export function BasicDocument({ products, total, customer, seller }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text
            style={[
              styles.saleInfo,
              { borderBottomWidth: 1, borderBottomColor: '#363636' },
            ]}
          >
            Cliente: {customer}
          </Text>
          <Text
            style={[
              styles.saleInfo,
              { borderBottomWidth: 1, borderBottomColor: '#363636' },
            ]}
          >
            Vendedor: {seller.name}
          </Text>
          <Text
            style={[
              styles.saleInfo,
              { borderBottomWidth: 1, borderBottomColor: '#363636' },
            ]}
          >
            Chave PIX: {seller.pix}
          </Text>
          <Text style={styles.saleInfo}>Banco: {seller.bank}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Produtos</Text>

          <View style={styles.list}>
            {products.map((product, index) => {
              return (
                <View
                  key={product.id}
                  style={[
                    styles.listItem,
                    {
                      backgroundColor: index % 2 === 0 ? '#e6e6e6' : '#f5f5f5',
                    },
                  ]}
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
