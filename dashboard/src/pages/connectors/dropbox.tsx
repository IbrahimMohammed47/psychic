/* eslint-disable jsx-a11y/anchor-is-valid */
import {
    Breadcrumb,
    Button,
    Label,
    TextInput,
    Spinner,
    Modal,
    Tabs,
    Table
  } from "flowbite-react";
  import { FC, useEffect } from "react";
  import { useState } from "react";
  import {  SiDropbox } from "react-icons/si";
  
  
  import {
    HiHome,
  } from "react-icons/hi";
  import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
  import { useUserStateContext } from "../../context/UserStateContext";
  import Text from "../../components/text";
  
  const DropboxConnectorPage: FC = function () {
    const [authorized, setAuthorized] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [clientSecret, setClientSecret] = useState('');
    const [connections, setConnections] = useState([] as any[])
  
    const {bearer} = useUserStateContext()
  
    async function authorize() {
      setAuthLoading(true)
      const url = import.meta.env.VITE_SERVER_URL + '/set-custom-connector-credentials';
      var payload = {
        connector_id: "gdrive",
        credential: JSON.parse(clientSecret)
      }
  
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearer}` },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData = await response.json();
        const isAuthorized = jsonData.status.is_enabled
        console.log(jsonData)
        if (!isAuthorized) {
          console.log('failed to authenticate')
        }
        setAuthLoading(false)
        setAuthorized(isAuthorized)
      } catch (error) {
        setAuthLoading(false)
      }
    }
  
    useEffect(() => {
      async function getConnectorStatus() {
        const url = import.meta.env.VITE_SERVER_URL + '/get-connector-status';
        console.log(url)
        var payload = {
          connector_id: "dropbox",
        }
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearer}` },
            body: JSON.stringify(payload),
          });
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const jsonData = await response.json();
          const isAuthorized = jsonData.status.is_enabled
          const connections = jsonData.status.connections
          setAuthorized(isAuthorized)
          setConnections(connections)
          setAuthLoading(false)
        } catch (error) {
          setAuthLoading(false)
        }
      }
      if (bearer) {
        getConnectorStatus()
      }
    }, [bearer])
        
  
    return (
      <NavbarSidebarLayout isFooter={false}>
        <div className="block items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex">
          <div className="mb-1 w-full">
            <div className="mb-4">
              <Breadcrumb className="mb-4">
                <Breadcrumb.Item href="/">
                  <div className="flex items-center gap-x-3">
                    <HiHome className="text-xl" />
                    <Text>Home</Text>
                  </div>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Connectors</Breadcrumb.Item>
                <Breadcrumb.Item>Dropbox</Breadcrumb.Item>
              </Breadcrumb>
              <div className="flex items-center">
                <SiDropbox className="mr-2 text-xl" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  Dropbox
                </h1>
              </div>
              <Text>View your active connections and configure the Dropbox connector here. You can create a new connection from the <a href="/playground" className="text-blue-400">Playground</a>.</Text>
            </div>
          </div>
        </div>
        <Tabs.Group>
        <Tabs.Item active={true} title="Active Connections">
            <div className="block items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex">
              <div className="mb-1 w-full">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-lg mb-2">
                    Active connections 
                  </h2>
                  <ConnectionsTable connections={connections} />
                </div>
              </div>
            </div>
          </Tabs.Item>
          <Tabs.Item active={true} title="Configuration">
            <div className="block items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex">
              <div className="mb-1 w-full">
                <div className="mb-4">
                  <form>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <div>
                        <AuthorizeModal 
                          authorize={authorize} 
                          authLoading={authLoading} 
                          authorized={authorized} 
                          clientSecret={clientSecret}
                          setClientSecret={setClientSecret}
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </Tabs.Item>
        </Tabs.Group>
      </NavbarSidebarLayout>
    );
  };
  
  interface AuthorizeModalProps {
    authorize: () => void;
    authorized: boolean;
    authLoading: boolean;
    clientSecret: string;
    setClientSecret: (clientSecret: string) => void;
  }
  
  const AuthorizeModal: FC<AuthorizeModalProps> = function ({
    authorize, clientSecret, setClientSecret, authorized, authLoading
  }: AuthorizeModalProps) {
    const [isOpen, setOpen] = useState(false);
  
    return (
      <>
        <Button disabled={true} color="primary" className="mb-6"  onClick={() => setOpen(true) } >
          {authLoading ? <Spinner className="mr-3 text-sm" /> : <>
          {authorized ?  'Update Credentials'  : 'Custom Credentials'}
          </>}
        </Button>
        <Modal onClose={() => setOpen(false)} show={isOpen}>
          <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
            <strong>Enable Custom Drive Connector</strong>
          </Modal.Header>
          <Modal.Body>
            <form>
              <div className="lg:col-span-2">
                <div>
                  <Label htmlFor="apiKeys.label">Client Secret JSON</Label>
                  <TextInput
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder='Client Secret'
                    className="mt-1"
                  />
                </div>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button color="primary" onClick={() => {
              authorize()
              setOpen(false)
            }}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  };
  
  interface ConnectionsTableProps {
    connections: any[]
  }
  
  const ConnectionsTable: FC<ConnectionsTableProps> = function ({connections}: ConnectionsTableProps) {
    console.log(connections)
    return (
      <>
      <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
        <Table.Head className="bg-gray-100 dark:bg-gray-700">
          <Table.HeadCell>Account ID</Table.HeadCell>
          <Table.HeadCell>Dropbox Account ID</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {connections.map((item, i) => (
            <Table.Row key={i} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <Table.Cell className="whitespace-nowrap p-4 text-sm font-normal text-gray-500 dark:text-gray-400">
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                        {item.account_id}
                    </div>
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap p-4 text-sm font-normal text-gray-500 dark:text-gray-400">
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        {item.metadata.dropbox_account_id}
                    </div>
                </Table.Cell>
            </Table.Row>
            ))}
        </Table.Body>
      </Table>
      </>
    );
  };
  
  
  
  export default DropboxConnectorPage;
  