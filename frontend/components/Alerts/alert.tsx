import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export default function MyAlert({message}){

    return(
       <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Errores:</AlertTitle>
        <AlertDescription>
           <ul className="list-inside list-disc text-sm">
            <li>{message}</li>
          </ul>
        </AlertDescription>
      </Alert>
    )
}