import {
    Avatar,
    Button,
    Spinner
  } from "flowbite-react";
  
  import {
    HiLockClosed,
    HiEyeSlash
  } from "react-icons/hi2";
  import React from "react";
  import { useState, useEffect, useRef, useCallback} from "react";
  import { useModalContext } from "../../context/ModalContext";
  import SuccessIcon from "../icons/SuccessIcon";
  import ErrorIcon from "../icons/ErrorIcon";
  import { start } from "repl";
  import MetadataForm from "./GDriveMetadataForm";
import SubdomainMetadataForm from "./SubdomainMetadataForm";
import ApiKeysForm from "./ApiKeysForm";
import OAuthListenerForm from "./OAuthListenerForm";
import { AuthMethod } from "../../context/ModalContext";
  
  type Metadata = {
  [key: string]: string | null;
  };
  
  const ReadmeAuthFlow: React.FC = () => {
  
  const {
    authCode,
    setAuthCode,
    currentStep,
    setCurrentStep,
    selectedConnectorId,
    connectorName,
    customerLogoUrl,
    accountId,
    publicKey,
    metadata,
    setMetadata,
    setIsLoading,
    isSuccess,
    setIsSuccess,
    isLoading,
    error,
    setError,
    authorizeConnection,
    setNewConnection,
    credential,
    setCredential,
    startConnectorAuthFlow
  } = useModalContext()

  const [authFlowStep, setAuthFlowStep] = useState(0)
  
  const renderModalBody = () => {

    switch (authFlowStep) {
      case 0:
        return (
          <> 
            <ApiKeysForm 
                onSubmit={(email: string, apiKey: string) => {
                    setIsLoading(true)
                    completeAuthWithKey(selectedConnectorId, apiKey)      
                    // setAuthFlowStep(authFlowStep + 1)    
                }}
                emailRequired={false}
                appName={connectorName}
                loading={isLoading}
            />
          </>
        )
      case 1: 
        console.log('error', error)
        return  (
          <> 
            {isSuccess && <div className="flex flex-col mb-4 space-y-4 items-center text-center">
              <SuccessIcon />
              <p className="text-gray-600">You have successfully connected to <span className="font-bold">{connectorName}</span>.</p>
            </div>}
            {!isSuccess && <div className="flex flex-col mb-4 space-y-4 items-center text-center">
              <ErrorIcon />
              <div>
                <p className="text-gray-600">We couldn't connect to <span className="font-bold">{connectorName}</span>.</p>
                <p className="mt-1 text-sm text-gray-600">Try it one more time? If it still doesn’t work, contact Psychic support <a href="mailto:support@psychic.dev" className="underline text-blue-500 hover:text-blue-600">here</a> and we’ll fix it.</p>
              </div>
            </div>}
          </>
          
        )
    }

    async function completeAuthWithKey(connectorId: string, apiKey: string) {
      if (!accountId || !publicKey) {
        setError('Invalid account_id or public_key')
        setIsLoading(false)
        return
      }
      const result = await authorizeConnection(
          connectorId, 
          accountId, 
          publicKey,
          null,
          metadata,
          AuthMethod.API_KEY,
          {api_key: apiKey},
      )

      console.log('result', result)
      if (!result) {
        setError('Something went wrong. Please try again.')
        setIsSuccess(false)
        setIsLoading(false)
        return
      }
      setNewConnection(result.connection)
      setIsLoading(false)
      setIsSuccess(true)
      // Notify opening window that auth is complete
      if (window.opener) {
        window.opener.postMessage(result.connection, '*')
      }
      setAuthFlowStep(authFlowStep + 1)
    }


    return (
      <div className="space-y-6 px-8">
          <div className="text-center">
            <div className="text-center">
              <Spinner size="xl"/>
            </div>
            <p className="mt-6">Authenticating with <span className="font-bold">{connectorName}</span>...</p>
          </div> 
      </div>
    )
  }
  
  const renderModalFooter = () => {

    if (isLoading) {
      return <></>
    }

    if (authFlowStep === 1 && isSuccess) {
      return (
        <div className="flex flex-col items-center"> 
        <Button size="xl" className="w-3/5 min-w-300" onClick={() => window.close()}>
            Finish
          </Button>
        </div>
      )
    } else {
      return (
        <div className="flex flex-col items-center"> 
        <Button color="gray" size="xl" className="w-3/5 min-w-300" onClick={() => {
            setCurrentStep(currentStep - 1)
        }}>
          Go Back
        </Button>
        </div>
      )
    }
  }
  
  async function completeAuthWithApiKey(connectorId: string, email: string, apiKey: string) {
    if (!accountId || !publicKey) {
      setError('Invalid account_id or public_key')
      setIsLoading(false)
      return
    }
    const result = await authorizeConnection(
        connectorId, 
        accountId, 
        publicKey,
        undefined, 
        metadata,
        AuthMethod.API_KEY,
        {email: email, api_key: apiKey},
    )
    if (!result) {
      setError('Something went wrong. Please try again.')
      setIsSuccess(false)
      setIsLoading(false)
      return
    }
    setNewConnection(result.connection)
    setIsLoading(false)
    setIsSuccess(true)
    // Notify opening window that auth is complete
    if (window.opener) {
      window.opener.postMessage(result.connection, '*')
    }
    setAuthFlowStep(authFlowStep + 1)
  }
  
  return (
    <div className="px-8">
      {renderModalBody()}
      {/* {renderResult()} */}
      {renderModalFooter()}
    </div>
  );
  }
  
  export default ReadmeAuthFlow;
  
  
  