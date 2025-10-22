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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, Trash2, Plus } from 'lucide-react'

interface Material {
  id: number
  name: string
  stock: number
  unit: string
  min_stock: number
  created_at: string
  updated_at: string
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    stock: 0,
    unit: '',
    min_stock: 10,
  })

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/admin/materials')
      const data = await response.json()
      setMaterials(data)
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (material?: Material) => {
    if (material) {
      setEditingMaterial(material)
      setFormData({
        name: material.name,
        stock: material.stock,
        unit: material.unit,
        min_stock: material.min_stock,
      })
    } else {
      setEditingMaterial(null)
      setFormData({
        name: '',
        stock: 0,
        unit: '',
        min_stock: 10,
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingMaterial(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingMaterial
        ? `/api/admin/materials/${editingMaterial.id}`
        : '/api/admin/materials'
      
      const method = editingMaterial ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchMaterials()
        handleCloseDialog()
      } else {
        alert('Failed to save material')
      }
    } catch (error) {
      console.error('Error saving material:', error)
      alert('Error saving material')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this material?')) return

    try {
      const response = await fetch(`/api/admin/materials/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchMaterials()
      } else {
        alert('Failed to delete material')
      }
    } catch (error) {
      console.error('Error deleting material:', error)
      alert('Error deleting material')
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
        <h1 className="text-3xl font-bold text-gray-900">Materials Management</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Material
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Materials List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>{material.stock}</TableCell>
                  <TableCell>{material.unit}</TableCell>
                  <TableCell>{material.min_stock}</TableCell>
                  <TableCell>
                    {material.stock <= material.min_stock ? (
                      <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                        Sufficient
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(material)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(material.id)}
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
        <DialogContent className='bg-white'>
          <DialogHeader>
            <DialogTitle>
              {editingMaterial ? 'Edit Material' : 'Add New Material'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Material Name</Label>
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
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  placeholder="e.g., kg, pcs, liter"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_stock">Minimum Stock</Label>
                <Input
                  id="min_stock"
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) =>
                    setFormData({ ...formData, min_stock: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingMaterial ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}