import { ActionModal } from 'components/shared/ActionModal';
import { FilePond } from 'components/shared/form/Filepond';
import { Input, Textarea, Switch } from 'components/ui';

export default function CarouselModal({ title, confirmText, showModal, setShowModal, handleCreateCarousel, createLoading, formData, setFormData }) {
    return (
        <ActionModal
            show={showModal}
            title={title}
            confirmText={confirmText}
            onClose={() => setShowModal(false)}
            onConfirm={handleCreateCarousel}
            loading={createLoading}
        >
            <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto p-1 text-left">
                <Input
                    label="Title"
                    placeholder="Enter carousel title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />

                <Textarea
                    label="Description"
                    placeholder="Enter short description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />

                <Input
                    label="Link"
                    placeholder="Enter carousel link"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                />

                <div className="flex items-center gap-2 py-2 border-b border-gray-100 dark:border-dark-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-dark-200">Is Active : </span>
                    <Switch
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-dark-200">Image</label>

                    {/* If formData.image is a string (URL), show the existing image preview separately to avoid CORS in FilePond */}
                    {typeof formData.image === 'string' && formData.image && (
                        <div className="relative w-full h-32 mb-2 group">
                            <img
                                src={formData.image}
                                className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-dark-700"
                                alt="Current Preview"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                <span className="text-white font-medium text-xs">Current Image</span>
                            </div>
                        </div>
                    )}

                    <FilePond
                        // Only pass actual file objects to FilePond, NOT URL strings
                        files={typeof formData.image !== 'string' && formData.image ? [formData.image] : []}
                        onupdatefiles={(fileItems) => {
                            const file = fileItems.length > 0 ? fileItems[0].file : null;
                            setFormData(prev => ({ ...prev, image: file }));
                        }}
                        allowMultiple={false}
                        maxFiles={1}
                        name="image"
                        labelIdle={typeof formData.image === 'string' ? "Select new image to replace current" : 'Drag & Drop your image or <span class="filepond--label-action">Browse</span>'}
                        imagePreviewHeight={150}
                    />
                </div>
            </div>
        </ActionModal>
    )
}
