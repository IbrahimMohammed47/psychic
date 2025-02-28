/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Breadcrumb,
  Button,
  Label,
  TextInput,
  Spinner,
  Tabs,
  Table
} from "flowbite-react";
import { FC, useEffect } from "react";
import { useState } from "react";
// import { SiGoogledrive } from "react-icons/si";


import {
  HiHome,
} from "react-icons/hi";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { useUserStateContext } from "../../context/UserStateContext";
import Text from "../../components/text";


const GoogleDriveIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="20px" height="20px">
        <path fill="#FFC107" d="M17 6L31 6 45 30 31 30z"/><path fill="#1976D2" d="M9.875 42L16.938 30 45 30 38 42z"/><path fill="#4CAF50" d="M3 30.125L9.875 42 24 18 17 6z"/>
    </svg>
  );
};

const GoogleDriveConnectorPage: FC = function () {
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
        connector_id: "gdrive",
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
        const customCredentials = jsonData.status.custom_credentials
        const connections = jsonData.status.connections
        if (customCredentials) {
          setClientSecret(JSON.stringify(customCredentials))
        }
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
                  <Text className="dark:text-white">Home</Text>
                </div>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Connectors</Breadcrumb.Item>
              <Breadcrumb.Item>Google Drive</Breadcrumb.Item>
            </Breadcrumb>
            <div className="flex items-center ">
             <GoogleDriveIcon />
              <h1 className=" mx-2 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                Google Drive
              </h1>
            </div>
            <Text>View your active connections and configure the Google Drive connector here. You can create a new connection from the <a href="/playground" className="text-blue-400">Playground</a>.</Text>
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
  console.log(authorized)

  return (
    <>
          <Text className="font-bold">Set Custom Credentials</Text>

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

          <Button className="mt-4" color="primary" onClick={() => {
            authorize()
          }}>
            {authLoading ? <Spinner /> : 'Save'}
          </Button>
    </>
  )
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
        <Table.HeadCell>Folder ID</Table.HeadCell>
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
                      {item.metadata.folder_id}
                  </div>
              </Table.Cell>
          </Table.Row>
          ))}
      </Table.Body>
    </Table>
    </>
  );
};


export default GoogleDriveConnectorPage;
