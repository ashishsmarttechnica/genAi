import { ActionModal } from 'components/shared/ActionModal';
import { FilePond } from 'components/shared/form/Filepond';
import { Input, Textarea, Select, Switch } from 'components/ui';

export default function PromptCreateModal({ showModal, setShowModal, handleCreatePrompt, createLoading, formData, setFormData, categoryData }) {
    return (
        <ActionModal
            show={showModal}
            title="Create New Prompt"
            confirmText="Create"
            onClose={() => setShowModal(false)}
            onConfirm={handleCreatePrompt}
            loading={createLoading}
        >
            <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto p-1">
                <Input
                    label="Title"
                    placeholder="Enter prompt title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />

                <Textarea
                    label="ReadyMate Prompt"
                    placeholder="Enter the actual prompt text"
                    rows={4}
                    value={formData.readyMatePrompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, readyMatePrompt: e.target.value }))}
                />

                <Input
                    label="Instructions"
                    placeholder="Enter additional instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                />

                <Select
                    label="Category"
                    value={formData.categoryIds}
                    onChange={(e) => {
                        const val = e.target.value;
                        console.log("Category Selected:", val);
                        setFormData(prev => ({ ...prev, categoryIds: val }));
                    }}
                >
                    <option value="" disabled>Select Category</option>
                    {categoryData?.categories?.map(cat => (
                        <option key={cat._id || cat.id} value={cat._id || cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </Select>

                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-dark-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-dark-200">Is Active</span>
                    <Switch
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-dark-200">Thumbnail</label>
                    <FilePond
                        files={formData.thumbnail ? [formData.thumbnail] : []}
                        onupdatefiles={(fileItems) => {
                            // console.log("FilePond Update:", fileItems);
                            const file = fileItems.length > 0 ? fileItems[0].file : null;
                            setFormData(prev => ({ ...prev, thumbnail: file }));
                        }}
                        allowMultiple={false}
                        maxFiles={1}
                        name="thumbnail"
                        labelIdle='Drag & Drop your image or <span class="filepond--label-action">Browse</span>'
                        imagePreviewHeight={150}
                    />
                </div>
            </div>
        </ActionModal>
    )
}
