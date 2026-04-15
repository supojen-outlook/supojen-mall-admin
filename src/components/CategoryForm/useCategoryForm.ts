import { ref } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import type { Category } from '@/model';
import { addCategory, updateCategory, updateAsset } from '@/services';

/**
 * 分類表單屬性介面
 */
export interface CategoryFormProps {
  /** 是否顯示表單對話框 */
  modelValue: boolean;
  /** 表單模式：創建或編輯 */
  mode: 'create' | 'edit';
  /** 初始數據（編輯模式時使用） */
  initialData?: Category | null;
  /** 是否禁用表單 */
  disabled?: boolean;
}

/**
 * 分類表單事件介面
 */
export interface CategoryFormEmits {
  /** 更新 modelValue 事件 */
  (e: 'update:modelValue', value: boolean): void;
  /** 表單提交成功事件 */
  (e: 'success', data: Category): void;
}

/**
 * 分類表單組合式函數
 * 用於處理分類的創建和編輯表單邏輯
 * @param props 組件屬性
 * @param emit 事件發射器
 * @returns 表單相關的狀態和方法
 */
export function useCategoryForm(props: CategoryFormProps, emit: CategoryFormEmits) {
  const loading = ref(false);                              // 加載狀態

  // 表單數據
  const formData = ref<{
    name: string;
    slug: string;
    parentId: number | undefined;
    status: 'active' | 'inactive';
    imageUrl: string;
    isLeaf: boolean;
    sortOrder: number;
  }>({
    name: '',
    slug: '',
    parentId: undefined,
    status: 'active',
    imageUrl: '',
    isLeaf: false,
    sortOrder: 0,
  });

  // Validation rules
  const rules = ref<FormRules>({
    name: [{ required: true, message: '請輸入分類名稱', trigger: 'blur' }],
    status: [{ required: true, message: '請選擇狀態', trigger: 'change' }]
  });

  /**
   * 初始化表單數據
   * 根據當前模式（創建/編輯）初始化表單數據
   * 在編輯模式下，會加載分類的詳細信息
   */
  const initFormData = async () => {    
    // 編輯模式且有初始數據時，加載分類詳細信息
    if (props.mode === 'edit' && props.initialData) {
      try {
        loading.value = true;
        
        // 設置表單數據
        formData.value = {
          name: props.initialData.name,
          slug: props.initialData.slug || '',
          parentId: props.initialData.parentId || undefined,
          status: (props.initialData.status as 'active' | 'inactive') || 'active',
          imageUrl: props.initialData.imageUrl || '',
          isLeaf: props.initialData.isLeaf || false,
          sortOrder: props.initialData.sortOrder || 0,
        };
      } catch (error) {
        console.error('獲取分類數據失敗:', error);
        ElMessage.error('獲取分類數據失敗');
        // 關閉對話框
        emit('update:modelValue', false);
      } finally {
        loading.value = false;
      }
    } else {
      // 創建模式，重置表單為默認值
      formData.value = {
        name: '',
        slug: '',
        parentId: undefined,
        status: 'active',
        imageUrl: '',
        isLeaf: false,
        sortOrder: 0
      };
    }
  };

  /**
   * 處理表單提交
   * @param formEl 表單實例引用
   */
  const handleSubmit = async (formEl: FormInstance | undefined) => {
    // 如果表單實例不存在，直接返回
    if (!formEl) return;

    try {
      // 執行表單驗證
      await formEl.validate();
    } catch (error) {
      // 驗證失敗時直接返回，不執行後續操作
      return;
    }

    try {
      // 設置加載狀態
      loading.value = true;
      
      if (props.mode === 'create') {
        // 創建模式：調用添加分類API
        const newCategory = await addCategory({
          name: formData.value.name,
          slug: formData.value.slug,
          parentId: formData.value.parentId || undefined,
          status: formData.value.status,
          imageUrl: formData.value.imageUrl,
          isLeaf: formData.value.isLeaf
        });
        
        // 更新分類的媒體檔案, 調用更新媒體檔案API
        await updateAsset({
          url: formData.value.imageUrl,
          targetType: "category",
          targetId: newCategory.id
        });

        // 觸發成功事件，傳遞新創建的分類數據
        emit('success', newCategory);
      } else {
        // 編輯模式：確保有初始ID
        if (!props.initialData?.id) return;
        
        // 調用更新分類API
        await updateCategory({
          id: props.initialData.id,
          name: formData.value.name,
          slug: formData.value.slug,
          parentId: formData.value.parentId || undefined,
          status: formData.value.status,
          imageUrl: formData.value.imageUrl,
          isLeaf: formData.value.isLeaf
        });
        
        // 更新分類的媒體檔案, 調用更新媒體檔案API
        await updateAsset({
          url: formData.value.imageUrl,
          targetType: "category",
          targetId: props.initialData.id
        });

        // 觸發成功事件，合併表單值和ID
        emit('success', { ...formData.value, id: props.initialData.id } as Category);
      }
    } catch (error) {
      ElMessage.error('操作失敗，請稍後重試');
    } finally {
      // 無論成功或失敗，都取消加載狀態
      loading.value = false;
    }
  };

  /**
   * 關閉表單對話框
   * 重置表單字段並觸發更新事件
   * @param formEl 表單實例引用
   */
  const handleClose = (formEl: FormInstance | undefined) => {
    // 重置表單字段
    formEl?.resetFields();
    // 觸發更新事件，關閉對話框
    emit('update:modelValue', false);
  };

  // 導出所有需要暴露給組件的屬性和方法
  return {
    loading,               // 加載狀態
    formData,              // 表單數據
    rules,                 // 表單驗證規則
    initFormData,          // 初始化表單數據
    handleSubmit,          // 處理表單提交
    handleClose,           // 處理關閉對話框
  } as const;
}
