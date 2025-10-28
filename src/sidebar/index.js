import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { PanelBody, TextControl, SelectControl, ToggleControl, TextareaControl, TextareaControl as Textarea, Button } from '@wordpress/components';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import './style.scss';

const ProductDataSidebar = () => {
    // Get current post ID, meta, and attributes
    const { postId, meta, postType, status, date, password, slug, excerpt } = useSelect((select) => ({
        postId: select('core/editor').getCurrentPostId(),
        meta: select('core/editor').getEditedPostAttribute('meta'),
        postType: select('core/editor').getCurrentPostType(),
        status: select('core/editor').getEditedPostAttribute('status'),
        date: select('core/editor').getEditedPostAttribute('date'),
        password: select('core/editor').getEditedPostAttribute('password'),
        slug: select('core/editor').getEditedPostAttribute('slug'),
        excerpt: select('core/editor').getEditedPostAttribute('excerpt'),
    }));

    // Only show for products
    if (postType !== 'product') {
        return null;
    }
    
    // Close all panels on mount
    useEffect(() => {
        const closeAllPanels = () => {
            const panelNames = [
                'product-images',
                'page-settings',
                'product-type',
                'product-pricing',
                'product-inventory',
                'product-shipping',
                'product-short-description',
                'product-reviews',
                'product-advanced'
            ];
            
            panelNames.forEach((name, index) => {
                setTimeout(() => {
                    const toggle = document.querySelector(`.components-panel__body-toggle[aria-controls*="${name}"]`);
                    if (toggle) {
                        // Close if expanded
                        if (toggle.getAttribute('aria-expanded') === 'true') {
                            toggle.click();
                        }
                    }
                }, 100 * (index + 1));
            });
        };
        
        // Run after a delay to ensure component is mounted
        const timer = setTimeout(closeAllPanels, 300);
        return () => clearTimeout(timer);
    }, []);

    const { editPost } = useDispatch('core/editor');
    const { removeEditorPanel } = useDispatch('core/edit-post');

    // Hide WordPress core panels using the WordPress API
    useEffect(() => {
        // Remove unwanted WordPress core panels
        removeEditorPanel('featured-image'); // Featured Image panel
        removeEditorPanel('post-excerpt');   // Excerpt panel
        removeEditorPanel('post-status');    // Status panel
        removeEditorPanel('post-link');      // Permalink panel
        removeEditorPanel('page-attributes'); // Page attributes
        
        // Try alternative panel names
        setTimeout(() => {
            try {
                removeEditorPanel('discussion-panel');
            } catch (e) {
                // Panel might not exist
            }
        }, 100);

        // Hide read time and last edited info - very specific targeting
        const hidePostInfo = () => {
            document.querySelectorAll('*').forEach(el => {
                // Skip if already processed or in our custom panels
                if (el.hasAttribute('data-hidden-by-studio') || 
                    el.closest('.product-images-panel, .page-settings-panel, .product-type-panel, .product-pricing-panel, .product-inventory-panel, .product-shipping-panel, .product-short-description-panel, .product-reviews-panel, .product-advanced-panel')) {
                    return;
                }

                const text = el.textContent.trim().toLowerCase();
                
                // Only hide if exact match - very specific
                if (text === 'minute read' || 
                    text === 'last edited' ||
                    text.includes('words,') || 
                    text === 'words, 1 minute read time' ||
                    text.includes('last edited an hour ago') ||
                    text.includes('last edited 2 hours ago')) {
                    
                    // Make sure it's a small text element, not a large container
                    if (el.offsetHeight < 50 && el.offsetWidth < 500) {
                        el.style.cssText = 'display: none !important; visibility: hidden !important; height: 0 !important; overflow: hidden !important;';
                        el.setAttribute('data-hidden-by-studio', 'true');
                    }
                }
            });
        };
        
        setTimeout(hidePostInfo, 50);
        const infoInterval = setInterval(hidePostInfo, 200);
        
        return () => clearInterval(infoInterval);
    }, []);

    // Helper to update meta
    const updateMeta = (key, value) => {
        editPost({ meta: { [key]: value } });
    };
    
    // Helper to update post attributes
    const updateAttribute = (key, value) => {
        editPost({ [key]: value });
    };
    
    // Get product type (simple, grouped, external, variable)
    const productType = meta._product_type || 'simple';
    
    // Helper to update product type
    const updateProductType = (newType) => {
        updateMeta('_product_type', newType);
    };

    // Status options
    const statusOptions = [
        { label: __('Draft', 'product-studio'), value: 'draft' },
        { label: __('Pending', 'product-studio'), value: 'pending' },
        { label: __('Private', 'product-studio'), value: 'private' },
        { label: __('Published', 'product-studio'), value: 'publish' },
    ];

    // Get product gallery images
    const galleryImages = meta._product_image_gallery ? meta._product_image_gallery.split(',').filter(id => id) : [];

    // Helper to update gallery
    const updateGallery = (images) => {
        updateMeta('_product_image_gallery', images.join(','));
    };

    return (
        <>
            <PluginDocumentSettingPanel
                name="product-images"
                title={__('Product Images', 'product-studio')}
                className="product-images-panel"
                initialOpen={false}
            >
                <MediaUploadCheck>
                    <MediaUpload
                        onSelect={(media) => {
                            updateMeta('_thumbnail_id', media.id.toString());
                        }}
                        allowedTypes={['image']}
                        value={parseInt(meta._thumbnail_id || 0)}
                        render={({ open }) => (
                            <div 
                                onClick={open}
                                style={{
                                    border: '2px dashed #ddd',
                                    borderRadius: '4px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    marginBottom: '16px',
                                    minHeight: '120px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    gap: '10px'
                                }}
                            >
                                {meta._thumbnail_id ? (
                                    <>
                                        {__('Product image ID:', 'product-studio')} {meta._thumbnail_id}
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            {__('Click to replace', 'product-studio')}
                                        </div>
                                    </>
                                ) : __('Click to add product image', 'product-studio')}
                            </div>
                        )}
                    />
                </MediaUploadCheck>

                <MediaUploadCheck>
                    <MediaUpload
                        onSelect={(media) => {
                            const newGallery = [...galleryImages, media.id.toString()];
                            updateGallery(newGallery);
                        }}
                        allowedTypes={['image']}
                        multiple={true}
                        gallery
                        value={galleryImages.map(id => parseInt(id))}
                        render={({ open }) => (
                            <div 
                                onClick={open}
                                style={{
                                    border: '2px dashed #ddd',
                                    borderRadius: '4px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    minHeight: '120px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    gap: '10px'
                                }}
                            >
                                {galleryImages.length > 0 ? (
                                    <>
                                        {__('Gallery:', 'product-studio')} {galleryImages.length} {__('image(s)', 'product-studio')}
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            {__('Click to add more', 'product-studio')}
                                        </div>
                                    </>
                                ) : __('Click to add gallery images', 'product-studio')}
                            </div>
                        )}
                    />
                </MediaUploadCheck>
            </PluginDocumentSettingPanel>

            <PluginDocumentSettingPanel
                name="page-settings"
                title={__('Page Settings', 'product-studio')}
                className="page-settings-panel"
                initialOpen={false}
            >
                <TextareaControl
                    label={__('Excerpt', 'product-studio')}
                    value={excerpt || ''}
                    onChange={(value) => updateAttribute('excerpt', value)}
                    help={__('Write an excerpt for your product', 'product-studio')}
                    rows={3}
                />

                <SelectControl
                    label={__('Status', 'product-studio')}
                    value={status}
                    options={statusOptions}
                    onChange={(value) => updateAttribute('status', value)}
                />

                <TextControl
                    label={__('Date', 'product-studio')}
                    value={date || ''}
                    onChange={(value) => updateAttribute('date', value)}
                    type="datetime-local"
                    help={__('Set the publish date', 'product-studio')}
                />

                <TextControl
                    label={__('Slug', 'product-studio')}
                    value={slug || ''}
                    onChange={(value) => updateAttribute('slug', value)}
                    help={__('URL-friendly version of the title', 'product-studio')}
                />

                <TextControl
                    label={__('Password', 'product-studio')}
                    value={password || ''}
                    onChange={(value) => updateAttribute('password', value)}
                    type="password"
                    help={__('Optional password to protect this product', 'product-studio')}
                />
            </PluginDocumentSettingPanel>

            <PluginDocumentSettingPanel
                name="product-type"
                title={__('Product Type', 'product-studio')}
                className="product-type-panel"
                initialOpen={false}
            >
                <SelectControl
                    label={__('Product Type', 'product-studio')}
                    value={productType}
                    options={[
                        { label: __('Simple Product', 'product-studio'), value: 'simple' },
                        { label: __('Grouped Product', 'product-studio'), value: 'grouped' },
                        { label: __('External/Affiliate Product', 'product-studio'), value: 'external' },
                        { label: __('Variable Product', 'product-studio'), value: 'variable' }
                    ]}
                    onChange={updateProductType}
                    help={__('Choose the product type', 'product-studio')}
                />
            </PluginDocumentSettingPanel>

            {productType === 'simple' && (
                <PluginDocumentSettingPanel
                    name="product-pricing"
                    title={__('Pricing', 'product-studio')}
                    className="product-pricing-panel"
                    initialOpen={false}
                >
                    <TextControl
                        label={__('Regular Price ($)', 'product-studio')}
                        value={meta._regular_price || ''}
                        onChange={(value) => updateMeta('_regular_price', value)}
                        type="number"
                        step="0.01"
                        min="0"
                        help={__('The standard price for this product', 'product-studio')}
                    />
                    
                    <TextControl
                        label={__('Sale Price ($)', 'product-studio')}
                        value={meta._sale_price || ''}
                        onChange={(value) => updateMeta('_sale_price', value)}
                        type="number"
                        step="0.01"
                        min="0"
                        help={__('Optional discounted price', 'product-studio')}
                    />

                    <SelectControl
                        label={__('Tax Status', 'product-studio')}
                        value={meta._tax_status || 'taxable'}
                        options={[
                            { label: __('Taxable', 'product-studio'), value: 'taxable' },
                            { label: __('Shipping Only', 'product-studio'), value: 'shipping' },
                            { label: __('None', 'product-studio'), value: 'none' }
                        ]}
                        onChange={(value) => updateMeta('_tax_status', value)}
                    />
                </PluginDocumentSettingPanel>
            )}
            
            {productType === 'external' && (
                <PluginDocumentSettingPanel
                    name="product-pricing"
                    title={__('External Product Settings', 'product-studio')}
                    className="product-pricing-panel"
                    initialOpen={false}
                >
                    <TextControl
                        label={__('Button Text', 'product-studio')}
                        value={meta._button_text || __('Buy product', 'product-studio')}
                        onChange={(value) => updateMeta('_button_text', value)}
                        help={__('Text for the external product button', 'product-studio')}
                    />
                    
                    <TextControl
                        label={__('Product URL', 'product-studio')}
                        value={meta._product_url || ''}
                        onChange={(value) => updateMeta('_product_url', value)}
                        type="url"
                        help={__('External URL for this product', 'product-studio')}
                    />
                    
                    <TextControl
                        label={__('Regular Price ($)', 'product-studio')}
                        value={meta._regular_price || ''}
                        onChange={(value) => updateMeta('_regular_price', value)}
                        type="number"
                        step="0.01"
                        min="0"
                    />
                </PluginDocumentSettingPanel>
            )}

            {productType !== 'grouped' && productType !== 'external' && (
                <PluginDocumentSettingPanel
                    name="product-inventory"
                    title={__('Inventory', 'product-studio')}
                    className="product-inventory-panel"
                    initialOpen={false}
                >
                <TextControl
                    label={__('SKU', 'product-studio')}
                    value={meta._sku || ''}
                    onChange={(value) => updateMeta('_sku', value)}
                    help={__('Stock Keeping Unit - unique identifier', 'product-studio')}
                />

                <ToggleControl
                    label={__('Manage Stock', 'product-studio')}
                    checked={meta._manage_stock === 'yes'}
                    onChange={(checked) => updateMeta('_manage_stock', checked ? 'yes' : 'no')}
                />

                {meta._manage_stock === 'yes' && (
                    <>
                        <TextControl
                            label={__('Stock Quantity', 'product-studio')}
                            value={meta._stock || ''}
                            onChange={(value) => updateMeta('_stock', value)}
                            type="number"
                            min="0"
                        />

                        <TextControl
                            label={__('Low Stock Threshold', 'product-studio')}
                            value={meta._low_stock_amount || ''}
                            onChange={(value) => updateMeta('_low_stock_amount', value)}
                            type="number"
                            min="0"
                        />
                    </>
                )}

                {meta._manage_stock !== 'yes' && (
                    <SelectControl
                        label={__('Stock Status', 'product-studio')}
                        value={meta._stock_status || 'instock'}
                        options={[
                            { label: __('In Stock', 'product-studio'), value: 'instock' },
                            { label: __('Out of Stock', 'product-studio'), value: 'outofstock' },
                            { label: __('On Backorder', 'product-studio'), value: 'onbackorder' }
                        ]}
                        onChange={(value) => updateMeta('_stock_status', value)}
                    />
                )}
            </PluginDocumentSettingPanel>
            )}

            {productType !== 'external' && (
                <PluginDocumentSettingPanel
                    name="product-shipping"
                    title={__('Shipping', 'product-studio')}
                    className="product-shipping-panel"
                    initialOpen={false}
                >
                <div className="dimensions-grid">
                    <TextControl
                        label={__('Weight (lbs)', 'product-studio')}
                        value={meta._weight || ''}
                        onChange={(value) => updateMeta('_weight', value)}
                        type="number"
                        step="0.01"
                        min="0"
                    />

                    <TextControl
                        label={__('Length (in)', 'product-studio')}
                        value={meta._length || ''}
                        onChange={(value) => updateMeta('_length', value)}
                        type="number"
                        step="0.01"
                        min="0"
                    />

                    <TextControl
                        label={__('Width (in)', 'product-studio')}
                        value={meta._width || ''}
                        onChange={(value) => updateMeta('_width', value)}
                        type="number"
                        step="0.01"
                        min="0"
                    />

                    <TextControl
                        label={__('Height (in)', 'product-studio')}
                        value={meta._height || ''}
                        onChange={(value) => updateMeta('_height', value)}
                        type="number"
                        step="0.01"
                        min="0"
                    />
                </div>

                <SelectControl
                    label={__('Shipping Class', 'product-studio')}
                    value={meta._shipping_class || ''}
                    options={[
                        { label: __('No Shipping Class', 'product-studio'), value: '' },
                        { label: __('Standard', 'product-studio'), value: 'standard' },
                        { label: __('Express', 'product-studio'), value: 'express' }
                    ]}
                    onChange={(value) => updateMeta('_shipping_class', value)}
                />
            </PluginDocumentSettingPanel>
            )}

            <PluginDocumentSettingPanel
                name="product-short-description"
                title={__('Short Description', 'product-studio')}
                className="product-short-description-panel"
                initialOpen={false}
            >
                <TextareaControl
                    label={__('Product Short Description', 'product-studio')}
                    value={meta._excerpt || ''}
                    onChange={(value) => updateMeta('_excerpt', value)}
                    help={__('This appears below the product name. Used in product listings and search results.', 'product-studio')}
                    rows={5}
                />
            </PluginDocumentSettingPanel>

            <PluginDocumentSettingPanel
                name="product-reviews"
                title={__('Reviews', 'product-studio')}
                className="product-reviews-panel"
                initialOpen={false}
            >
                <ToggleControl
                    label={__('Enable Reviews', 'product-studio')}
                    checked={meta._enable_reviews === 'yes'}
                    onChange={(checked) => updateMeta('_enable_reviews', checked ? 'yes' : 'no')}
                    help={__('Allow customers to submit reviews', 'product-studio')}
                />
            </PluginDocumentSettingPanel>

            <PluginDocumentSettingPanel
                name="product-advanced"
                title={__('Advanced', 'product-studio')}
                className="product-advanced-panel"
                initialOpen={false}
            >
                <ToggleControl
                    label={__('Virtual Product', 'product-studio')}
                    checked={meta._virtual === 'yes'}
                    onChange={(checked) => updateMeta('_virtual', checked ? 'yes' : 'no')}
                />

                <ToggleControl
                    label={__('Downloadable', 'product-studio')}
                    checked={meta._downloadable === 'yes'}
                    onChange={(checked) => updateMeta('_downloadable', checked ? 'yes' : 'no')}
                />
            </PluginDocumentSettingPanel>
        </>
    );
};

registerPlugin('product-studio-sidebar', {
    render: ProductDataSidebar,
    icon: 'products',
});
