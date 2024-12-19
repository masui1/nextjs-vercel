'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Card, Row, Col, Input, Button, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';

interface DataType {
  key: string;
  id: number;
  content: string;
  createdAt: string;
}

export default function Home() {
  const [content, setContent] = useState('');
  const [dataSource, setDataSource] = useState<DataType[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const response = await fetch('/api/notes');
      const notes = await response.json();
      setDataSource(notes);
    };
    fetchNotes();
  }, []);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value);
  };

  const handleSaveClick = async () => {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    const notes = await response.json();
    setDataSource(notes);

    setContent('');
  };

  const handleDeleteClick = async (id: number) => {
    const response = await fetch(`/api/notes?id=${id}`, {
      method: 'DELETE',
    });

    const notes = await response.json();
    setDataSource(notes);
  };

  const columns: ColumnsType<DataType> = [
    {
      title: 'created_at',
      dataIndex: 'createdAt',
      width: '20%',
      render: (date: Date) => new Date(date).toLocaleDateString(),
      sorter: (a: DataType, b: DataType) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
    },
    {
      title: 'content',
      dataIndex: 'content',
      width: '75%',
    },
    {
      width: '5%',
      render: (record: DataType) => (
        <Button danger onClick={() => handleDeleteClick(record.id)}>
          Delete
        </Button>
      ),
    },
  ];  

  const centeredStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  };

  return (
    <div style={centeredStyle}>
      <Card title='Note' style={{ width: 800 }}>
        <Row>
          <Col span={16}>
            <Input
              placeholder='content'
              value={content}
              onChange={handleInputChange}
            />
          </Col>
          <Col span={7} offset={1}>
            <Button type='primary' onClick={handleSaveClick}>
              Save
            </Button>
          </Col>
        </Row>
        <Table
          dataSource={dataSource}
          columns={columns}
          rowKey={(record) => record.id}
          pagination={{
            pageSize: 5,
          }}
          style={{ marginTop: 20 }}
        />
      </Card>
    </div>
  );
}