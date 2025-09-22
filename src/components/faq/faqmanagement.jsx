
// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog"
// import { Badge } from "@/components/ui/badge"
// import { Plus, Edit, Trash2, Loader2, Search, X, HelpCircle, Calendar, BarChart3 } from "lucide-react"
// import { useFAQ } from "@/contexts/faqs-context"

// // Skeleton Components
// const HeaderSkeleton = () => (
//   <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
//     <div className="space-y-3">
//       <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
//       <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
//     </div>
//     <div className="h-10 w-24 bg-slate-200 rounded animate-pulse" />
//   </div>
// )

// const SearchSkeleton = () => (
//   <Card className="border-0 shadow-sm bg-white">
//     <CardContent className="p-6">
//       <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
//     </CardContent>
//   </Card>
// )

// const FAQCardSkeleton = () => (
//   <Card className="border-0 shadow-sm bg-white animate-pulse">
//     <CardHeader className="pb-4">
//       <div className="flex justify-between items-start">
//         <div className="flex-1 space-y-3">
//           <div className="h-5 w-3/4 bg-slate-200 rounded" />
//           <div className="flex gap-4">
//             <div className="h-3 w-24 bg-slate-200 rounded" />
//             <div className="h-3 w-24 bg-slate-200 rounded" />
//           </div>
//         </div>
//         <div className="flex gap-2">
//           <div className="h-8 w-8 bg-slate-200 rounded" />
//           <div className="h-8 w-8 bg-slate-200 rounded" />
//         </div>
//       </div>
//     </CardHeader>
//     <CardContent>
//       <div className="space-y-2">
//         <div className="h-4 w-full bg-slate-200 rounded" />
//         <div className="h-4 w-5/6 bg-slate-200 rounded" />
//         <div className="h-4 w-4/6 bg-slate-200 rounded" />
//       </div>
//     </CardContent>
//   </Card>
// )

// const StatsSkeleton = () => (
//   <Card className="border-0 shadow-sm bg-white">
//     <CardContent className="p-6">
//       <div className="grid grid-cols-2 gap-6 text-center">
//         <div className="space-y-2">
//           <div className="h-8 w-12 bg-slate-200 rounded animate-pulse mx-auto" />
//           <div className="h-4 w-16 bg-slate-200 rounded animate-pulse mx-auto" />
//         </div>
//         <div className="space-y-2">
//           <div className="h-8 w-12 bg-slate-200 rounded animate-pulse mx-auto" />
//           <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mx-auto" />
//         </div>
//       </div>
//     </CardContent>
//   </Card>
// )

// export default function FAQManagement() {
//   const { faqs, loading, fetchFAQs, createFAQ, updateFAQ, deleteFAQ } = useFAQ()
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [editingFAQ, setEditingFAQ] = useState(null)
//   const [deleteFAQState, setDeleteFAQState] = useState(null)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [formData, setFormData] = useState({
//     question: "",
//     answer: "",
//   })

//   useEffect(() => {
//     fetchFAQs()
//   }, [])

//   const resetForm = () => {
//     setFormData({
//       question: "",
//       answer: "",
//     })
//     setEditingFAQ(null)
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setIsSubmitting(true)

//     try {
//       if (editingFAQ) {
//         await updateFAQ(editingFAQ.id, formData)
//       } else {
//         await createFAQ(formData)
//       }
//       setIsDialogOpen(false)
//       resetForm()
//     } catch (error) {
//       console.error("Error saving FAQ:", error)
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleEdit = (faq) => {
//     setEditingFAQ(faq)
//     setFormData({
//       question: faq.question,
//       answer: faq.answer,
//     })
//     setIsDialogOpen(true)
//   }

//   const handleDelete = async (id) => {
//     try {
//       await deleteFAQ(id)
//     } catch (error) {
//       console.error("Error deleting FAQ:", error)
//     }
//     setDeleteFAQState(null)
//   }

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     })
//   }

//   const clearSearch = () => {
//     setSearchTerm("")
//   }

//   const filteredFAQs = faqs.filter(
//     (faq) =>
//       faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
//   )

//   return (
//     <div className="min-h-screen bg-slate-50/50">
//       <div className="max-w-7xl mx-auto p-6 space-y-8">
//         {/* Header */}
//         {loading ? (
//           <HeaderSkeleton />
//         ) : (
//           <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
//             <div className="space-y-2">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
//                   <HelpCircle className="h-6 w-6 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-3xl font-bold text-slate-900">FAQ Management</h1>
//                   <p className="text-slate-600">Manage frequently asked questions</p>
//                 </div>
//               </div>
//             </div>
//             <Dialog
//               open={isDialogOpen}
//               onOpenChange={(open) => {
//                 setIsDialogOpen(open)
//                 if (!open) resetForm()
//               }}
//             >
//               <DialogTrigger asChild>
//                 <Button className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-sm">
//                   <Plus className="w-4 h-4 mr-2" />
//                   Add FAQ
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//                 <DialogHeader className="space-y-3">
//                   <DialogTitle className="text-xl">{editingFAQ ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
//                   <DialogDescription className="text-slate-600">
//                     {editingFAQ ? "Update the FAQ details" : "Create a new frequently asked question"}
//                   </DialogDescription>
//                 </DialogHeader>
//                 <form onSubmit={handleSubmit} className="space-y-6 mt-6">
//                   <div className="space-y-2">
//                     <Label htmlFor="question" className="text-sm font-medium text-slate-700">
//                       Question *
//                     </Label>
//                     <Input
//                       id="question"
//                       value={formData.question}
//                       onChange={(e) => setFormData({ ...formData, question: e.target.value })}
//                       placeholder="Enter the frequently asked question"
//                       className="border-slate-200 focus:border-slate-400 transition-colors"
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="answer" className="text-sm font-medium text-slate-700">
//                       Answer *
//                     </Label>
//                     <Textarea
//                       id="answer"
//                       value={formData.answer}
//                       onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
//                       placeholder="Enter the detailed answer to this question"
//                       rows={6}
//                       className="border-slate-200 focus:border-slate-400 transition-colors resize-none"
//                       required
//                     />
//                   </div>
//                   <div className="flex gap-3 pt-4 border-t border-slate-200">
//                     <Button
//                       type="submit"
//                       className="flex-1 bg-gradient-to-br from-blue-600 to-blue-700 text-white"
//                       disabled={isSubmitting}
//                     >
//                       {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//                       {editingFAQ ? "Update FAQ" : "Add FAQ"}
//                     </Button>
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => setIsDialogOpen(false)}
//                       disabled={isSubmitting}
//                       className="border-slate-200 text-slate-700 hover:bg-slate-50"
//                     >
//                       Cancel
//                     </Button>
//                   </div>
//                 </form>
//               </DialogContent>
//             </Dialog>
//           </div>
//         )}

//         {/* Search */}
//         {loading ? (
//           <SearchSkeleton />
//         ) : (
//           <Card className="border-0 shadow-sm bg-white">
//             <CardContent className="p-6">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
//                 <Input
//                   placeholder="Search FAQs by question or answer..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 pr-10 border-slate-200 focus:border-slate-400 transition-colors"
//                 />
//                 {searchTerm && (
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={clearSearch}
//                     className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-100"
//                   >
//                     <X className="h-3 w-3" />
//                   </Button>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* FAQ List */}
//         <div className="space-y-4">
//           {loading ? (
//             // Show skeleton FAQs
//             Array.from({ length: 4 }).map((_, index) => <FAQCardSkeleton key={index} />)
//           ) : filteredFAQs.length === 0 ? (
//             <Card className="border-0 shadow-sm bg-white">
//               <CardContent className="text-center py-16">
//                 <div className="space-y-3">
//                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
//                     <HelpCircle className="h-8 w-8 text-slate-400" />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-medium text-slate-900">
//                       {searchTerm ? "No FAQs found" : "No FAQs yet"}
//                     </h3>
//                     <p className="text-slate-600 mt-1">
//                       {searchTerm
//                         ? `No FAQs match "${searchTerm}". Try a different search term.`
//                         : "Create your first FAQ to help users find answers quickly."}
//                     </p>
//                   </div>
//                   {searchTerm ? (
//                     <Button variant="outline" onClick={clearSearch} className="mt-4">
//                       Clear search
//                     </Button>
//                   ) : (
//                     <Button
//                       onClick={() => setIsDialogOpen(true)}
//                       className="mt-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white"
//                     >
//                       <Plus className="h-4 w-4 mr-2" />
//                       Add First FAQ
//                     </Button>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           ) : (
//             filteredFAQs.map((faq, index) => (
//               <Card
//                 key={faq.id}
//                 className="border-0 shadow-sm bg-white hover:shadow-md transition-all duration-200 group"
//               >
//                 <CardHeader className="pb-4">
//                   <div className="flex justify-between items-start">
//                     <div className="flex-1 min-w-0">
//                       <CardTitle className="text-lg text-slate-900 mb-3 leading-relaxed pr-4">{faq.question}</CardTitle>
//                       <div className="flex gap-4 text-sm text-slate-500">
//                         <div className="flex items-center gap-1">
//                           <Calendar className="h-3 w-3" />
//                           <span>Created {formatDate(faq.createdAt)}</span>
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <Calendar className="h-3 w-3" />
//                           <span>Updated {formatDate(faq.updatedAt)}</span>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                       <Button
//                         size="sm"
//                         variant="ghost"
//                         onClick={() => handleEdit(faq)}
//                         className="h-8 w-8 p-0 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
//                         title="Edit FAQ"
//                       >
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="ghost"
//                         onClick={() => setDeleteFAQState(faq)}
//                         className="h-8 w-8 p-0 hover:bg-red-50 text-slate-600 hover:text-red-600"
//                         title="Delete FAQ"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
//                 </CardContent>
//               </Card>
//             ))
//           )}
//         </div>

//         {/* Stats */}
//         {loading ? (
//           <StatsSkeleton />
//         ) : (
//           <Card className="border-0 shadow-sm bg-white">
//             <CardHeader className="pb-4">
//               <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
//                 <BarChart3 className="h-5 w-5 text-slate-600" />
//                 Statistics
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-2 gap-6">
//                 <div className="text-center space-y-2">
//                   <div className="text-3xl font-bold text-slate-900">{faqs.length}</div>
//                   <div className="text-sm text-slate-600 font-medium">Total FAQs</div>
//                 </div>
//                 <div className="text-center space-y-2">
//                   <div className="text-3xl font-bold text-slate-900">{filteredFAQs.length}</div>
//                   <div className="text-sm text-slate-600 font-medium">
//                     {searchTerm ? "Search Results" : "Visible FAQs"}
//                   </div>
//                 </div>
//               </div>
//               {searchTerm && (
//                 <div className="mt-4 pt-4 border-t border-slate-100 text-center">
//                   <Badge variant="outline" className="border-slate-200 text-slate-600">
//                     Filtering by: "{searchTerm}"
//                   </Badge>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         )}

//         {/* Delete Confirmation Dialog */}
//         <AlertDialog open={!!deleteFAQState} onOpenChange={() => setDeleteFAQState(null)}>
//           <AlertDialogContent className="max-w-md">
//             <AlertDialogHeader className="space-y-3">
//               <AlertDialogTitle className="text-xl text-slate-900">Delete FAQ</AlertDialogTitle>
//               <AlertDialogDescription className="text-slate-600">
//                 This action cannot be undone. This will permanently delete the FAQ "{deleteFAQState?.question}".
//               </AlertDialogDescription>
//             </AlertDialogHeader>
//             <AlertDialogFooter className="gap-2 sm:gap-2">
//               <AlertDialogCancel className="border-slate-200 text-slate-700 hover:bg-slate-50">
//                 Cancel
//               </AlertDialogCancel>
//               <Button
//               disabled={loading}
//                 variant="destructive"
//                 onClick={() => handleDelete(deleteFAQState.id)}
//                 className="bg-red-600 hover:bg-red-700 text-white"
//               >
//                 Delete FAQ
//               </Button>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialog>
//       </div>
//     </div>
//   )
// }
