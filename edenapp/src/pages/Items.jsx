import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export default function Items() {
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    }
  })

  if (isLoading) return <div>Loading items...</div>
  if (error) return <div>Error loading items: {error.message}</div>

  return (
    <div className="items-page">
      <h1>Browse Items</h1>
      <div className="items-grid">
        {items?.map(item => (
          <div key={item.id} className="item-card">
            {item.image_url && (
              <img src={item.image_url} alt={item.title} className="item-image" />
            )}
            <div className="item-details">
              <h3>{item.title}</h3>
              <p className="item-price">${item.price}</p>
              <p className="item-description">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}