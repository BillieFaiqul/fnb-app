'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, Trash2, Plus, X } from 'lucide-react'
import Image from 'next/image'

interface Menu {
  id: number
  category_id: number | null
  name: string
  description: string | null
  price: number
  image: string | null
  is_active: boolean
  category_name?: string
  materials?: MenuMaterial[]
}

interface Category {
  id: number
  name: string
}

interface Material {
  id: number
  name: string
  stock: number
  unit: string
}

interface MenuMaterial {
  material_id: number
  quantity_needed: number
  material_name?: string
  stock?: number
  unit?: string
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: 0,
    image: '',
    is_active: true,
  })
  const [menuMaterials, setMenuMaterials] = useState<MenuMaterial[]>([])

  useEffect(() => {
    fetchMenus()
    fetchCategories()
    fetchMaterials()
  }, [])

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/admin/menus')
      const data = await response.json()
      setMenus(data)
    } catch (error) {
      console.error('Error fetching menus:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/admin/materials')
      const data = await response.json()
      setMaterials(data)
    } catch (error) {
      console.error('Error fetching materials:', error)
    }
  }

  const handleOpenDialog = async (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu)
      setFormData({
        category_id: menu.category_id?.toString() || '',
        name: menu.name,
        description: menu.description || '',
        price: menu.price,
        image: menu.image || '',
        is_active: menu.is_active,
      })

      // Fetch menu materials
      try {
        const response = await fetch(`/api/admin/menus/${menu.id}`)
        const data = await response.json()
        setMenuMaterials(data.materials || [])
      } catch (error) {
        console.error('Error fetching menu materials:', error)
        setMenuMaterials([])
      }
    } else {
      setEditingMenu(null)
      setFormData({
        category_id: '',
        name: '',
        description: '',
        price: 0,
        image: '',
        is_active: true,
      })
      setMenuMaterials([])
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingMenu(null)
    setMenuMaterials([])
  }

  const handleAddMaterial = () => {
    setMenuMaterials([
      ...menuMaterials,
      { material_id: 0, quantity_needed: 0 }
    ])
  }

  const handleRemoveMaterial = (index: number) => {
    const newMaterials = menuMaterials.filter((_, i) => i !== index)
    setMenuMaterials(newMaterials)
  }

  const handleMaterialChange = (index: number, field: string, value: any) => {
    const newMaterials = [...menuMaterials]
    newMaterials[index] = {
      ...newMaterials[index],
      [field]: field === 'material_id' ? parseInt(value) : parseFloat(value)
    }
    setMenuMaterials(newMaterials)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData((prev) => ({ ...prev, image: data.url }))
      } else {
        alert('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingMenu
        ? `/api/admin/menus/${editingMenu.id}`
        : '/api/admin/menus'
      
      const method = editingMenu ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        materials: menuMaterials.filter(m => m.material_id > 0 && m.quantity_needed > 0)
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        fetchMenus()
        handleCloseDialog()
      } else {
        alert('Failed to save menu')
      }
    } catch (error) {
      console.error('Error saving menu:', error)
      alert('Error saving menu')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu?')) return

    try {
      const response = await fetch(`/api/admin/menus/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchMenus()
      } else {
        alert('Failed to delete menu')
      }
    } catch (error) {
      console.error('Error deleting menu:', error)
      alert('Error deleting menu')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Menus Management</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Menu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menus List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menus.map((menu) => (
                <TableRow key={menu.id}>
                  <TableCell>
                    {menu.image ? (
                      <Image
                        src={menu.image}
                        alt={menu.name}
                        width={50}
                        height={50}
                        className="rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        No Image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{menu.name}</TableCell>
                  <TableCell>{menu.category_name || '-'}</TableCell>
                  <TableCell>Rp {menu.price.toLocaleString()}</TableCell>
                  <TableCell>
                    {menu.is_active ? (
                      <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(menu)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(menu.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMenu ? 'Edit Menu' : 'Add New Menu'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Menu Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter menu description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (Rp)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseInt(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
                </div>
                {formData.image && (
                  <div className="mt-2">
                    <Image
                      src={formData.image}
                      alt="Preview"
                      width={200}
                      height={200}
                      className="rounded object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Materials Required</Label>
                  <Button type="button" size="sm" onClick={handleAddMaterial}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Material
                  </Button>
                </div>
                <div className="space-y-2 border rounded p-3">
                  {menuMaterials.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No materials added yet
                    </p>
                  ) : (
                    menuMaterials.map((material, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label className="text-xs">Material</Label>
                          <Select
                            value={material.material_id.toString()}
                            onValueChange={(value) =>
                              handleMaterialChange(index, 'material_id', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select material" />
                            </SelectTrigger>
                            <SelectContent>
                              {materials.map((mat) => (
                                <SelectItem key={mat.id} value={mat.id.toString()}>
                                  {mat.name} (Stock: {mat.stock} {mat.unit})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-32">
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={material.quantity_needed}
                            onChange={(e) =>
                              handleMaterialChange(index, 'quantity_needed', e.target.value)
                            }
                            placeholder="Qty"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveMaterial(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Active
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {editingMenu ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}