import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import browserImageCompression from 'browser-image-compression'

const createListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']),
})

export default function CreateListing() {
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createListingSchema)
  })

  const handleImageUpload = async (file) => {
    try {
      const compressedFile = await browserImageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024
      })
      
      const fileName = `${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('item-images')
        .upload(fileName, compressedFile)
        
      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(fileName)
        
      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const onSubmit = async (data) => {
    try {
      setUploading(true)
      const imageUrl = data.image?.[0] ? await handleImageUpload(data.image[0]) : null
      
      const { error } = await supabase
        .from('items')
        .insert([{
          ...data,
          image_url: imageUrl,
          user_id: (await supabase.auth.getUser()).data.user.id
        }])
        
      if (error) throw error
      navigate('/items')
    } catch (error) {
      console.error('Error creating listing:', error)
      alert('Error creating listing. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="create-listing">
      <h1>Create New Listing</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            {...register('title')}
          />
          {errors.title && <span className="error">{errors.title.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            {...register('description')}
          />
          {errors.description && <span className="error">{errors.description.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="price">Price ($)</label>
          <input
            type="number"
            id="price"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && <span className="error">{errors.price.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="condition">Condition</label>
          <select id="condition" {...register('condition')}>
            <option value="new">New</option>
            <option value="like-new">Like New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
          {errors.condition && <span className="error">{errors.condition.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="image">Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            {...register('image')}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={uploading}>
          {uploading ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  )
}