'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Lead } from '@/lib/supabase'
import { getLeads, updateLeadStage } from '@/lib/actions'
import { formatCurrency } from '@/lib/utils'

const stages = [
  { id: 'new', name: 'New', color: 'bg-blue-100 text-blue-800' },
  { id: 'contacted', name: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'qualified', name: 'Qualified', color: 'bg-purple-100 text-purple-800' },
  { id: 'proposal', name: 'Proposal', color: 'bg-orange-100 text-orange-800' },
  { id: 'won', name: 'Won', color: 'bg-green-100 text-green-800' },
  { id: 'lost', name: 'Lost', color: 'bg-red-100 text-red-800' },
]

export function PipelineBoard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [columns, setColumns] = useState<Record<string, Lead[]>>({})

  useEffect(() => {
    async function fetchLeads() {
      try {
        const data = await getLeads()
        setLeads(data)
        
        // Group leads by stage
        const grouped = stages.reduce((acc, stage) => {
          acc[stage.id] = data.filter(lead => lead.stage === stage.id)
          return acc
        }, {} as Record<string, Lead[]>)
        
        setColumns(grouped)
      } catch (error) {
        console.error('Error fetching leads:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchLeads()
  }, [])

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    
    if (source.droppableId === destination.droppableId) {
      // Reorder within the same column
      const column = columns[source.droppableId]
      const newColumn = Array.from(column)
      const [removed] = newColumn.splice(source.index, 1)
      newColumn.splice(destination.index, 0, removed)
      
      setColumns({
        ...columns,
        [source.droppableId]: newColumn
      })
    } else {
      // Move to different column
      const sourceColumn = columns[source.droppableId]
      const destColumn = columns[destination.droppableId]
      const [moved] = sourceColumn.splice(source.index, 1)
      
      const newMoved = { ...moved, stage: destination.droppableId }
      
      const newSourceColumn = Array.from(sourceColumn)
      const newDestColumn = Array.from(destColumn)
      newDestColumn.splice(destination.index, 0, newMoved)
      
      setColumns({
        ...columns,
        [source.droppableId]: newSourceColumn,
        [destination.droppableId]: newDestColumn
      })
      
      // Update in database
      try {
        await updateLeadStage(draggableId, destination.droppableId)
      } catch (error) {
        console.error('Error updating lead stage:', error)
        // Revert the change if database update fails
        const revertedSourceColumn = Array.from(columns[source.droppableId])
        const revertedDestColumn = Array.from(columns[destination.droppableId])
        revertedSourceColumn.splice(source.index, 0, moved)
        revertedDestColumn.splice(destination.index, 1)
        
        setColumns({
          ...columns,
          [source.droppableId]: revertedSourceColumn,
          [destination.droppableId]: revertedDestColumn
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading pipeline...</p>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {stages.map((stage) => (
          <div key={stage.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-medium px-2 py-1 rounded-full ${stage.color}`}>
                {stage.name}
              </h3>
              <span className="text-xs text-gray-500">
                {columns[stage.id]?.length || 0}
              </span>
            </div>
            
            <Droppable droppableId={stage.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[200px] transition-colors ${
                    snapshot.isDraggingOver ? 'bg-blue-50' : ''
                  }`}
                >
                  {columns[stage.id]?.map((lead, index) => (
                    <Draggable key={lead.id} draggableId={lead.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-3 cursor-move ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {lead.name}
                          </div>
                          {lead.company && (
                            <div className="text-xs text-gray-500 mb-1">
                              {lead.company}
                            </div>
                          )}
                          {lead.expected_value && (
                            <div className="text-xs font-medium text-green-600">
                              {formatCurrency(lead.expected_value)}
                            </div>
                          )}
                          {lead.probability && (
                            <div className="text-xs text-gray-500">
                              {lead.probability}% probability
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}
