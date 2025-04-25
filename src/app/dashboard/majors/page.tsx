'use client';

import { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, Select, message } from 'antd';
import { majorService, Major } from '@/services/majorService';
import { departmentService } from '@/services/departmentService';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function MajorsPage() {
  const [majors, setMajors] = useState<Major[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [majorsData, departmentsData] = await Promise.all([
        majorService.getAllMajors(),
        departmentService.getAllDepartments()
      ]);
      setMajors(majorsData);
      setDepartments(departmentsData);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMajor(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (major: Major) => {
    setEditingMajor(major);
    form.setFieldsValue(major);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await majorService.deleteMajor(id);
      message.success('Xóa ngành học thành công');
      loadData();
    } catch (error) {
      message.error('Lỗi khi xóa ngành học');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingMajor) {
        await majorService.updateMajor(editingMajor.id, values);
        message.success('Cập nhật ngành học thành công');
      } else {
        await majorService.createMajor(values);
        message.success('Tạo ngành học thành công');
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error('Lỗi khi lưu ngành học');
    }
  };

  const columns = [
    {
      title: 'Tên ngành',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Khoa',
      dataIndex: 'departmentName',
      key: 'departmentName',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdByName',
      key: 'createdByName',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Major) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý ngành học</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Thêm ngành học
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={majors}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingMajor ? 'Cập nhật ngành học' : 'Thêm ngành học mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên ngành"
            rules={[{ required: true, message: 'Vui lòng nhập tên ngành' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="departmentId"
            label="Khoa"
            rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
          >
            <Select
              options={departments.map(dept => ({
                label: dept.name,
                value: dept.id
              }))}
            />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingMajor ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 